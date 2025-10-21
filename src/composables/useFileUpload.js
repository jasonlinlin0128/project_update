import { ref } from 'vue'
import { storage } from '@/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * 文件上传 Composable
 */
export function useFileUpload() {
  const files = ref([])
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  /**
   * 添加文件到待上传列表
   */
  const addFiles = (fileList) => {
    for (let file of fileList) {
      if (file.size > MAX_FILE_SIZE) {
        error.value = `檔案 ${file.name} 超過 10MB 限制`
        continue
      }

      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        file: file
      }

      files.value.push(fileInfo)
    }

    error.value = null
  }

  /**
   * 移除文件
   */
  const removeFile = (index) => {
    const file = files.value[index]
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
    files.value.splice(index, 1)
  }

  /**
   * 上传单个文件到 Firebase Storage
   */
  const uploadFile = async (file, path) => {
    try {
      const fileRef = storageRef(storage, `${path}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(fileRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return {
        success: true,
        url: downloadURL,
        name: file.name,
        size: file.size,
        type: file.type
      }
    } catch (err) {
      console.error('上傳檔案失敗:', err)
      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * 批量上传所有文件
   */
  const uploadAll = async (path = 'uploads') => {
    uploading.value = true
    uploadProgress.value = 0
    error.value = null

    const results = []
    const totalFiles = files.value.length

    for (let i = 0; i < totalFiles; i++) {
      const fileInfo = files.value[i]
      const result = await uploadFile(fileInfo.file, path)

      results.push(result)
      uploadProgress.value = ((i + 1) / totalFiles) * 100

      if (!result.success) {
        error.value = `上傳 ${fileInfo.name} 失敗`
      }
    }

    uploading.value = false

    // 清空已上传的文件
    files.value.forEach(file => {
      if (file.url) URL.revokeObjectURL(file.url)
    })
    files.value = []

    return results
  }

  /**
   * 清空文件列表
   */
  const clearFiles = () => {
    files.value.forEach(file => {
      if (file.url) URL.revokeObjectURL(file.url)
    })
    files.value = []
    error.value = null
  }

  return {
    files,
    uploading,
    uploadProgress,
    error,
    addFiles,
    removeFile,
    uploadFile,
    uploadAll,
    clearFiles
  }
}
