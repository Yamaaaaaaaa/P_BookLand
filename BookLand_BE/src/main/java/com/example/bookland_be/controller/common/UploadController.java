package com.example.bookland_be.controller.common;

import com.example.bookland_be.service.SupabaseStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Upload", description = "API quản lý upload file")
public class UploadController {

    private final SupabaseStorageService storageService;

    // Danh sách định dạng được phép
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    // Kích thước tối đa: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;


    @GetMapping("/images")
    @Operation(
            summary = "Lấy danh sách ảnh đã upload",
            description = "Trả về toàn bộ ảnh trong Supabase Storage bucket"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách ảnh thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "500", description = "Lỗi server")
    })
    public ResponseEntity<?> getAllImages() {

        try {
            List<Map<String, Object>> images = storageService.listImages();
            return ResponseEntity.ok(Map.of(
                    "total", images.size(),
                    "images", images
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "error", "Không thể lấy danh sách ảnh",
                            "message", e.getMessage()
                    )
            );
        }
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload ảnh lên Supabase Storage",
            description = "Upload một ảnh lên Supabase Storage. Hỗ trợ: JPG, JPEG, PNG, GIF, WEBP. Tối đa 5MB."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Upload thành công",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(example = "{\"url\": \"https://supabase.co/storage/v1/object/public/images/abc123.jpg\"}")
                    )
            ),
            @ApiResponse(responseCode = "400", description = "File không hợp lệ"),
            @ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @ApiResponse(responseCode = "500", description = "Lỗi server")
    })
    public ResponseEntity<?> uploadImage(
            @Parameter(
                    description = "File ảnh cần upload (JPG, PNG, GIF, WEBP - Max 5MB)",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        // Validate file không null
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "File không được để trống")
            );
        }

        // Validate loại file
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", "Định dạng file không được hỗ trợ",
                            "allowedTypes", ALLOWED_IMAGE_TYPES
                    )
            );
        }

        // Validate kích thước file
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", "File quá lớn. Kích thước tối đa 5MB",
                            "fileSize", file.getSize(),
                            "maxSize", MAX_FILE_SIZE
                    )
            );
        }

        try {
            String imageUrl = storageService.uploadImage(file);

            Map<String, Object> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("fileName", file.getOriginalFilename());
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "error", "Lỗi khi upload file",
                            "message", e.getMessage()
                    )
            );
        }
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload nhiều ảnh cùng lúc",
            description = "Upload nhiều ảnh lên Supabase Storage. Tối đa 10 ảnh, mỗi ảnh max 5MB."
    )
    public ResponseEntity<?> uploadMultipleImages(
            @Parameter(description = "Danh sách file ảnh (Max 10 files, mỗi file max 5MB)")
            @RequestParam("files") List<MultipartFile> files
    ) {

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Danh sách file không được để trống")
            );
        }

        if (files.size() > 10) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Tối đa 10 ảnh mỗi lần upload")
            );
        }

        try {
            List<Map<String, Object>> uploadedFiles = files.stream()
                    .map(file -> {
                        try {
                            // Validate từng file
                            if (file.getSize() > MAX_FILE_SIZE) {
                                Map<String, Object> error = new HashMap<>();
                                error.put("fileName", file.getOriginalFilename());
                                error.put("error", "File quá lớn");
                                return error;
                            }

                            String url = storageService.uploadImage(file);

                            Map<String, Object> result = new HashMap<>();
                            result.put("url", url);
                            result.put("fileName", file.getOriginalFilename());
                            result.put("fileSize", file.getSize());
                            result.put("success", true);
                            return result;

                        } catch (Exception e) {
                            Map<String, Object> error = new HashMap<>();
                            error.put("fileName", file.getOriginalFilename());
                            error.put("error", e.getMessage());
                            error.put("success", false);
                            return error;
                        }
                    })
                    .toList();

            return ResponseEntity.ok(Map.of("files", uploadedFiles));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Lỗi khi upload files", "message", e.getMessage())
            );
        }
    }
}