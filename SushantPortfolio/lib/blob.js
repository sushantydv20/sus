const { put, del } = require('@vercel/blob');

async function uploadImage(fileBuffer, fileName) {
  if (!fileBuffer || !fileName) {
    throw new Error('File buffer and filename are required');
  }
  
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required');
  }
  
  try {
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-z0-9._-]/gi, '_');
    const blobPath = `images/${timestamp}-${safeName}`;
    
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      token: blobToken
    });
    
    return blob.url;
  } catch (err) {
    console.error('Blob upload error:', err);
    throw new Error(`Failed to upload image: ${err.message}`);
  }
}

async function uploadZip(fileBuffer, fileName) {
  if (!fileBuffer || !fileName) {
    throw new Error('File buffer and filename are required');
  }
  
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required');
  }
  
  try {
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-z0-9._-]/gi, '_').replace(/\.zip$/i, '');
    const blobPath = `projects/${timestamp}-${safeName}.zip`;
    
    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      token: blobToken
    });
    
    return blob.url;
  } catch (err) {
    console.error('Blob upload error:', err);
    throw new Error(`Failed to upload project zip: ${err.message}`);
  }
}

async function deleteBlob(blobUrl) {
  if (!blobUrl) return;
  
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required');
  }
  
  try {
    await del(blobUrl, { token: blobToken });
  } catch (err) {
    console.error('Blob deletion error:', err);
    // Don't throw - continue even if deletion fails
  }
}

module.exports = { uploadImage, uploadZip, deleteBlob };
