package com.example.bookland_be.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadImage(MultipartFile file) throws IOException {

        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        String uploadUrl = supabaseUrl
                + "/storage/v1/object/"
                + bucket + "/" + fileName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(serviceKey);
        headers.setContentType(MediaType.parseMediaType(file.getContentType()));


        HttpEntity<byte[]> request =
                new HttpEntity<>(file.getBytes(), headers);

        restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                request,
                String.class
        );

        // Public URL
        return supabaseUrl
                + "/storage/v1/object/public/"
                + bucket + "/" + fileName;
    }


    /**
     * Lấy danh sách toàn bộ ảnh trong bucket
     */
    public List<Map<String, Object>> listImages() {

        String listUrl = supabaseUrl
                + "/storage/v1/object/list/"
                + bucket;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(serviceKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Supabase BẮT BUỘC: Body + Prefix trong Body
        Map<String, Object> body = Map.of(
                "prefix", ""
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<List> response = restTemplate.exchange(
                listUrl,
                HttpMethod.POST,
                request,
                List.class
        );

        List<Map<String, Object>> files = response.getBody();

        if (files != null) {
            files.forEach(file -> {
                String name = (String) file.get("name");
                String publicUrl = supabaseUrl
                        + "/storage/v1/object/public/"
                        + bucket + "/" + name;
                file.put("publicUrl", publicUrl);
            });
        }

        return files;
    }
}
