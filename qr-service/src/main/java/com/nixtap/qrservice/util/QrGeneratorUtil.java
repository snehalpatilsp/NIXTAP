package com.nixtap.qrservice.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.nixtap.qrservice.exception.QrGenerationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class QrGeneratorUtil {

    @Value("${qr.storage.path}")
    private String storagePath;

    @Value("${qr.image.size}")
    private int imageSize;

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Generates a QR code PNG from the given URL and color parameters,
     * writes the file to {@code storagePath}, and returns the absolute file path.
     *
     * @param targetUrl       URL to encode in the QR matrix
     * @param foregroundColor hex color string for dark modules  (e.g. "#000000")
     * @param backgroundColor hex color string for light modules (e.g. "#FFFFFF")
     * @return absolute path to the saved PNG file
     * @throws QrGenerationException if ZXing encoding or file I/O fails
     */
    public String generateAndSave(String targetUrl, String foregroundColor, String backgroundColor) {
        byte[] pngBytes = generatePngBytes(targetUrl, foregroundColor, backgroundColor);
        return saveToFile(pngBytes);
    }

    /**
     * Regenerates a QR code PNG, deletes the old file if it exists, and returns
     * the path to the newly saved file.
     *
     * @param oldFilePath     path to the previously saved PNG (may be null / blank)
     * @param targetUrl       URL to encode
     * @param foregroundColor hex color for dark modules
     * @param backgroundColor hex color for light modules
     * @return absolute path to the new PNG file
     */
    public String regenerateAndSave(
            String oldFilePath,
            String targetUrl,
            String foregroundColor,
            String backgroundColor) {

        deleteFile(oldFilePath);
        return generateAndSave(targetUrl, foregroundColor, backgroundColor);
    }

    /**
     * Reads a PNG file from disk and returns its raw bytes.
     *
     * @param filePath absolute path to the PNG file
     * @return PNG byte array
     * @throws QrGenerationException if the file cannot be read
     */
    public byte[] readFileBytes(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                throw new QrGenerationException(
                        "QR image file not found on disk: " + filePath);
            }
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new QrGenerationException(
                    "Failed to read QR image file: " + filePath, e);
        }
    }

    /**
     * Deletes a file from disk. Silently ignores null / blank paths and
     * non-existent files — deletion is best-effort on cleanup operations.
     *
     * @param filePath path to delete
     */
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("Deleted QR file: {}", filePath);
        } catch (IOException e) {
            // Log the failure but do not propagate — caller should proceed
            log.warn("Could not delete QR file {}: {}", filePath, e.getMessage());
        }
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Uses ZXing to encode the URL into a QR matrix and renders it as a PNG
     * byte array using the caller-supplied foreground / background colors.
     */
    private byte[] generatePngBytes(
            String targetUrl,
            String foregroundColor,
            String backgroundColor) {

        try {
            // ZXing encoding hints: high error correction, UTF-8, no quiet-zone padding
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(targetUrl, BarcodeFormat.QR_CODE, imageSize, imageSize, hints);

            // Parse hex colors — strip leading '#' before parsing
            int fgColor = parseHexColor(foregroundColor);
            int bgColor = parseHexColor(backgroundColor);

            // Render the bit matrix into a BufferedImage
            BufferedImage image = new BufferedImage(imageSize, imageSize, BufferedImage.TYPE_INT_RGB);
            for (int x = 0; x < imageSize; x++) {
                for (int y = 0; y < imageSize; y++) {
                    image.setRGB(x, y, bitMatrix.get(x, y) ? fgColor : bgColor);
                }
            }

            // Encode as PNG bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", outputStream);
            return outputStream.toByteArray();

        } catch (WriterException e) {
            throw new QrGenerationException(
                    "ZXing failed to encode QR matrix for URL: " + targetUrl, e);
        } catch (IOException e) {
            throw new QrGenerationException(
                    "Failed to encode QR image to PNG bytes for URL: " + targetUrl, e);
        }
    }

    /**
     * Ensures the storage directory exists, writes the PNG bytes to a UUID-named
     * file, and returns the absolute path string.
     */
    private String saveToFile(byte[] pngBytes) {
        try {
            Path storageDir = Paths.get(storagePath);
            if (!Files.exists(storageDir)) {
                Files.createDirectories(storageDir);
                log.info("Created QR storage directory: {}", storageDir.toAbsolutePath());
            }

            String fileName = UUID.randomUUID() + ".png";
            Path filePath = storageDir.resolve(fileName);
            Files.write(filePath, pngBytes);

            log.info("Saved QR code PNG to: {}", filePath.toAbsolutePath());
            return filePath.toAbsolutePath().toString();

        } catch (IOException e) {
            throw new QrGenerationException("Failed to save QR image file to disk.", e);
        }
    }

    /**
     * Parses a hex color string (with or without leading '#') into an RGB int.
     * Falls back to black on any parse error.
     */
    private int parseHexColor(String hexColor) {
        try {
            String clean = hexColor.startsWith("#") ? hexColor.substring(1) : hexColor;
            Color color = new Color(
                    Integer.parseInt(clean.substring(0, 2), 16),
                    Integer.parseInt(clean.substring(2, 4), 16),
                    Integer.parseInt(clean.substring(4, 6), 16)
            );
            return color.getRGB();
        } catch (Exception e) {
            log.warn("Invalid hex color '{}', defaulting to black.", hexColor);
            return Color.BLACK.getRGB();
        }
    }
}
