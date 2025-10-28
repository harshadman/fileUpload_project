'use strict'

const { pipeline } = require('stream/promises')
const { createWriteStream } = require('fs')
const { promises: fs } = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')
const { uploadsDir, categoriesDir, ensureUploadDirs, getFileCategory, formatFileSize } = require('../public/utils.js')
const { FileValidator } = require('../public/validator.js')

module.exports = async function (fastify, opts) {
  fastify.get('/hello', async (request, reply) => {
    return { msg: 'Hello from Fastify!' }
  })


  // Register plugins
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  });

  await fastify.register(import('@fastify/static'), {
    root: uploadsDir,
    prefix: '/uploads/'
  });

  // Create upload directories
  await ensureUploadDirs();

  // Set up validator
  const validator = new FileValidator();

  // Upload single file
  fastify.post('/api/upload/single', async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const validation = validator.validateFile(data.filename, data.file.bytesRead);
    if (!validation.valid) {
      return reply.code(400).send({
        error: 'File validation failed',
        details: validation.errors
      });
    }

    const ext = data.filename.substring(data.filename.lastIndexOf('.'));
    const uniqueFilename = `${randomUUID()}${ext}`;
    const category = getFileCategory(data.mimetype);
    const filepath = path.join(categoriesDir[category], uniqueFilename);

    try {
      await pipeline(data.file, createWriteStream(filepath));

      const stats = await fs.stat(filepath);

      return {
        success: true,
        file: {
          id: randomUUID(),
          originalFilename: data.filename,
          storedFilename: uniqueFilename,
          mimetype: data.mimetype,
          size: stats.size,
          formattedSize: formatFileSize(stats.size),
          category: category,
          uploadDate: new Date().toISOString(),
          url: `/uploads/${category}/${uniqueFilename}`
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to save file' });
    }
  });

  // Upload multiple files
  fastify.post('/api/upload/multiple', async (request, reply) => {
    const parts = request.parts();
    const results = [];
    const maxFiles = 10;
    let fileCount = 0;

    for await (const part of parts) {
      if (part.file) {
        fileCount++;

        if (fileCount > maxFiles) {
          return reply.code(400).send({
            error: `Too many files. Maximum ${maxFiles} files allowed.`
          });
        }

        const validation = validator.validateFile(part.filename);
        if (!validation.valid) {
          results.push({
            filename: part.filename,
            success: false,
            errors: validation.errors
          });
          continue;
        }

        const ext = part.filename.substring(part.filename.lastIndexOf('.'));
        const uniqueFilename = `${randomUUID()}${ext}`;
        const category = getFileCategory(part.mimetype);
        const filepath = path.join(categoriesDir[category], uniqueFilename);

        try {
          await pipeline(part.file, createWriteStream(filepath));
          const stats = await fs.stat(filepath);

          results.push({
            success: true,
            file: {
              id: randomUUID(),
              originalFilename: part.filename,
              storedFilename: uniqueFilename,
              mimetype: part.mimetype,
              size: stats.size,
              formattedSize: formatFileSize(stats.size),
              category: category,
              uploadDate: new Date().toISOString(),
              url: `/uploads/${category}/${uniqueFilename}`
            }
          });
        } catch (error) {
          fastify.log.error(error);
          results.push({
            filename: part.filename,
            success: false,
            errors: ['Failed to save file']
          });
        }
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      totalFiles: results.length,
      successful: successful.length,
      failed: failed.length,
      uploadTime: new Date().toISOString(),
      results: results
    };
  });

  // Get all files
  fastify.get('/api/files', async (request, reply) => {
    const files = [];

    for (const [category, dirPath] of Object.entries(categoriesDir)) {
      try {
        const fileList = await fs.readdir(dirPath);
        for (const filename of fileList) {
          const filepath = path.join(dirPath, filename);
          const stats = await fs.stat(filepath);

          files.push({
            id: randomUUID(),
            originalFilename: filename,
            storedFilename: filename,
            size: stats.size,
            formattedSize: formatFileSize(stats.size),
            category: category,
            uploadDate: stats.birthtime.toISOString(),
            url: `/uploads/${category}/${filename}`
          });
        }
      } catch (error) {
        fastify.log.error(`Error reading ${category} directory:`, error);
      }
    }

    return { files: files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)) };
  });

  // Delete file
  fastify.delete('/api/files/:category/:filename', async (request, reply) => {
    const { category, filename } = request.params;

    if (!categoriesDir[category]) {
      return reply.code(400).send({ error: 'Invalid category' });
    }

    const filepath = path.join(categoriesDir[category], filename);

    try {
      await fs.unlink(filepath);
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete file' });
    }
  });
}
