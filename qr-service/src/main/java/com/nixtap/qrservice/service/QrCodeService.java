package com.nixtap.qrservice.service;

import com.nixtap.qrservice.dto.request.QrCodeRequest;
import com.nixtap.qrservice.dto.response.QrCodeResponse;

import java.util.List;

public interface QrCodeService {

    /**
     * Generates a new QR code PNG, persists the file on disk, and saves the
     * entity record to the database. Returns the full metadata response.
     */
    QrCodeResponse generate(QrCodeRequest request);

    /**
     * Reads the PNG file for the given QR code ID from disk and returns
     * the raw bytes for streaming to the client as image/png.
     */
    byte[] download(Long id);

    /**
     * Returns all QR code metadata records belonging to a specific user.
     */
    List<QrCodeResponse> getByUserId(Long userId);

    /**
     * Returns the QR code metadata for the given business card ID.
     */
    QrCodeResponse getByCardId(Long cardId);

    /**
     * Updates the target URL and/or colors of an existing QR code, deletes the
     * old PNG, regenerates a fresh PNG, and updates the database record.
     */
    QrCodeResponse regenerate(Long id, QrCodeRequest request);

    /**
     * Deletes the QR code record from the database and removes the PNG file
     * from disk.
     */
    void delete(Long id);
}
