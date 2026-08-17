package com.nixtap.profileservice.util;

import com.nixtap.profileservice.entity.SocialLink;
import com.nixtap.profileservice.entity.UserProfile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Builds an RFC 6350 vCard 3.0 string from a UserProfile and visible SocialLinks.
 * Uses internal domain objects — no Feign calls needed (merged into profile-service).
 */
@Component
public class VCardBuilder {

    private static final String CRLF = "\r\n";

    public String build(UserProfile profile, List<SocialLink> links) {
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCARD").append(CRLF);
        sb.append("VERSION:3.0").append(CRLF);

        appendField(sb, "FN", profile.getFullName());

        String[] nameParts = splitName(profile.getFullName());
        appendField(sb, "N", nameParts[1] + ";" + nameParts[0] + ";;;");

        if (StringUtils.hasText(profile.getCompany()))
            appendField(sb, "ORG", profile.getCompany());

        if (StringUtils.hasText(profile.getDesignation()))
            appendField(sb, "TITLE", profile.getDesignation());

        if (StringUtils.hasText(profile.getEmail()))
            appendField(sb, "EMAIL;TYPE=INTERNET", profile.getEmail());

        if (StringUtils.hasText(profile.getPhone()))
            appendField(sb, "TEL;TYPE=CELL", profile.getPhone());

        if (StringUtils.hasText(profile.getWebsite()))
            appendField(sb, "URL", profile.getWebsite());

        buildAddress(sb, profile);

        if (StringUtils.hasText(profile.getHeadline()))
            appendField(sb, "NOTE", escape(profile.getHeadline()));

        if (StringUtils.hasText(profile.getProfileImage()))
            appendField(sb, "PHOTO;VALUE=URI", profile.getProfileImage());

        if (links != null) {
            for (SocialLink link : links) {
                if (link.isVisible() && StringUtils.hasText(link.getUrl())) {
                    String platform = link.getPlatform() != null
                            ? link.getPlatform().toLowerCase() : "other";
                    appendField(sb, "X-SOCIALPROFILE;TYPE=" + platform, link.getUrl());
                }
            }
        }

        sb.append("REV:").append(java.time.Instant.now().toString()).append(CRLF);
        sb.append("END:VCARD").append(CRLF);
        return sb.toString();
    }

    private void appendField(StringBuilder sb, String name, String value) {
        if (!StringUtils.hasText(value)) return;
        sb.append(name).append(":").append(value).append(CRLF);
    }

    private void buildAddress(StringBuilder sb, UserProfile p) {
        boolean hasAddr = StringUtils.hasText(p.getAddress())
                || StringUtils.hasText(p.getCity())
                || StringUtils.hasText(p.getState())
                || StringUtils.hasText(p.getCountry());
        if (!hasAddr) return;
        appendField(sb, "ADR;TYPE=WORK",
                ";;" + nvl(p.getAddress()) + ";" + nvl(p.getCity())
                        + ";" + nvl(p.getState()) + ";;" + nvl(p.getCountry()));
    }

    private String[] splitName(String fullName) {
        if (!StringUtils.hasText(fullName)) return new String[]{"", ""};
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts.length == 1 ? new String[]{"", parts[0]} : new String[]{parts[1], parts[0]};
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace(",", "\\,")
                .replace(";", "\\;").replace("\n", "\\n").replace("\r", "");
    }

    private String nvl(String value) { return value != null ? value : ""; }
}
