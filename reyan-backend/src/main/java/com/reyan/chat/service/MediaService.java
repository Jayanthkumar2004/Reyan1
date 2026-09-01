package com.reyan.chat.service;

import com.reyan.chat.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MediaService {

    @Value("${supabase.url:https://your-supabase-project.supabase.co}")
    private String supabaseUrl;

    private static final String UPLOAD_DIR = "uploads/";

    public Map<String, Object> uploadMedia(MultipartFile file, String folder) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        String filename = file.getOriginalFilename();
        String extension = "";
        if (filename != null && filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf("."));
        }

        String safeFileName = UUID.randomUUID().toString() + extension;

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR + (folder != null ? folder : "general"));
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(safeFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String mediaUrl = "/uploads/" + (folder != null ? folder + "/" : "") + safeFileName;

            Map<String, Object> response = new HashMap<>();
            response.put("mediaUrl", mediaUrl);
            response.put("filename", filename != null ? filename : safeFileName);
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());

            return response;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file", e);
        }
    }
}
