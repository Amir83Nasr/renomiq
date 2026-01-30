#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub extension: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RenamePair {
    pub from: String,
    pub to: String,
}

#[tauri::command]
async fn choose_folder() -> Result<Option<String>, String> {
    // Use tokio channel to convert callback-based dialog to async
    let (tx, rx) = tokio::sync::oneshot::channel();
    
    tauri::api::dialog::FileDialogBuilder::new().pick_folder(move |path| {
        let _ = tx.send(path);
    });
    
    match rx.await {
        Ok(path) => Ok(path.map(|p| p.to_string_lossy().to_string())),
        Err(_) => Err("Dialog cancelled".to_string()),
    }
}

#[tauri::command]
fn list_files(folder: String) -> Result<Vec<FileEntry>, String> {
    let path = PathBuf::from(&folder);
    if !path.is_dir() {
        return Err("Not a directory".into());
    }

    let mut entries = Vec::new();

    for entry in fs::read_dir(&path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        if !meta.is_file() {
            continue;
        }

        let p = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        let ext = p
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_string();

        entries.push(FileEntry {
            path: p.to_string_lossy().to_string(),
            name,
            extension: ext,
        });
    }

    Ok(entries)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ApplyResult {
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UndoResult {
    pub success: bool,
    pub restored_count: usize,
    pub error: Option<String>,
}

#[tauri::command]
fn apply_renames(pairs: Vec<RenamePair>) -> Result<ApplyResult, String> {
    // Detect conflicts in target paths
    use std::collections::HashMap;

    let mut counts: HashMap<&str, usize> = HashMap::new();
    for pair in &pairs {
        *counts.entry(&pair.to).or_insert(0) += 1;
    }

    if counts.values().any(|&c| c > 1) {
        return Ok(ApplyResult {
            success: false,
            error: Some("Conflicting target paths detected".into()),
        });
    }

    // Validate paths to prevent traversal attacks
    for pair in &pairs {
        let from = Path::new(&pair.from);
        let to = Path::new(&pair.to);

        // Check if source file exists
        if !from.exists() {
            return Ok(ApplyResult {
                success: false,
                error: Some(format!("Source file does not exist: {}", pair.from)),
            });
        }

        // Get the base directory from the first file to validate against
        if let Some(base_dir) = from.parent() {
            // Ensure target path stays within the same directory tree
            if let Some(target_parent) = to.parent() {
                if !target_parent.starts_with(base_dir) {
                    return Ok(ApplyResult {
                        success: false,
                        error: Some(
                            "Path traversal detected: target path outside allowed directory".into(),
                        ),
                    });
                }
            }
        }

        // Check for path traversal components
        if pair.to.contains("..") || pair.to.contains("\\") {
            return Ok(ApplyResult {
                success: false,
                error: Some("Invalid path components detected".into()),
            });
        }
    }

    for pair in &pairs {
        let from = Path::new(&pair.from);
        let to = Path::new(&pair.to);

        if let Some(parent) = to.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
        }

        fs::rename(from, to).map_err(|e| e.to_string())?;
    }

    Ok(ApplyResult {
        success: true,
        error: None,
    })
}

#[tauri::command]
fn undo_renames(pairs: Vec<RenamePair>) -> Result<UndoResult, String> {
    // Use the same logic as apply_renames since undo is just renaming files back
    let count = pairs.len();
    let result = apply_renames(pairs)?;

    Ok(UndoResult {
        success: result.success,
        restored_count: count,
        error: result.error,
    })
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FolderEntry {
    pub path: String,
    pub name: String,
}

#[tauri::command]
fn list_subfolders(folder: String) -> Result<Vec<FolderEntry>, String> {
    let path = PathBuf::from(&folder);
    if !path.is_dir() {
        return Err("Not a directory".into());
    }

    let mut entries = Vec::new();

    for entry in fs::read_dir(&path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        if !meta.is_dir() {
            continue;
        }

        let p = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        entries.push(FolderEntry {
            path: p.to_string_lossy().to_string(),
            name,
        });
    }

    // Sort by name
    entries.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(entries)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            choose_folder,
            list_files,
            apply_renames,
            undo_renames,
            list_subfolders
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
