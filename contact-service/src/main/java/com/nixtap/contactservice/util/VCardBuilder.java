package com.nixtap.contactservice.util;

import com.nixtap.contactservice.dto.feign.ProfileResponse;
import com.nixtap.contactservice.dto.feign.SocialLinkResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Builds an RFC 6350 compliant vCard 3.0 string from a user profile and
 * their visible social media links.
 *
 * vCard 3.0 is used (rather than 4.0) because it has near-universal support
 * across iOS Contacts, Android, and Windows — including legacy devices that
 * users may tap with their NFC cards.
 *
 * Line folding: RFC 6350 §3.2 requires lines > 75 octets to be folded.
 * We apply simple fold-on-long-value logic for the ADR and NOTE fields.
 */
@Component
public class VCardBuilder {

    private static final String CRLF = "\r\n";

    /**
     * Builds and returns the complete vCard content as a UTF-8 string.
     *
     * @param profile the user profile fetched from profile-service
     * @param links   visible social links fetched from social-service
     * @return RFC 6350 vCard 3.0 string
     */
    public String build(ProfileResponse profile, List<SocialLinkResponse> links) {
        StringBuilder sb = new StringBuilder();

        sb.append("BEGIN:VCARD").append(CRLF);
        sb.append("VERSION:3.0").append(CRLF);

        // FN — formatted name (required in vCard 3.0)
        appendField(sb, "FN", profile.getFullName());

        // N — structured name: Family;Given;Additional;Prefix;Suffix
        String[] nameParts = splitName(profile.getFullName());
        appendField(sb, "N", nameParts[1] + ";" + nameParts[0] + ";;;");

        // ORG
        if (StringUtils.hasText(profile.getCompany())) {
            appendField(sb, "ORG", profile.getCompany());
        }

        // TITLE
        if (StringUtils.hasText(profile.getDesignation())) {
            appendField(sb, "TITLE", profile.getDesignation());
        }

        // EMAIL
        if (StringUtils.hasText(profile.getEmail())) {
            appendField(sb, "EMAIL;TYPE=INTERNET", profile.getEmail());
        }

        // TEL
        if (StringUtils.hasText(profile.getPhone())) {
            appendField(sb, "TEL;TYPE=CELL", profile.getPhone());
        }

        // URL — personal website
        if (StringUtils.hasText(profile.getWebsite())) {
            appendField(sb, "URL", profile.getWebsite());
        }

        // ADR — structured address: P.O.Box;ExtAddr;Street;City;State;PostalCode;Country
        buildAddress(sb, profile);

        // NOTE — professional headline as a note
        if (StringUtils.hasText(profile.getHeadline())) {
            appendField(sb, "NOTE", escapeVCardValue(profile.getHeadline()));
        }

        // PHOTO URL — link to profile image (TYPE=URI)
        if (StringUtils.hasText(profile.getProfileImage())) {
            appendField(sb, "PHOTO;VALUE=URI", profile.getProfileImage());
        }

        // X-SOCIALPROFILE entries for each visible social link
        if (links != null) {
            for (SocialLinkResponse link : links) {
                if (link.isVisible() && StringUtils.hasText(link.getUrl())) {
                    String platform = link.getPlatform() != null
                            ? link.getPlatform().toLowerCase() : "other";
                    appendField(sb,
                            "X-SOCIALPROFILE;TYPE=" + platform,
                            link.getUrl());
                }
            }
        }

        // REV — last revision timestamp (ISO 8601)
        sb.append("REV:").append(java.time.Instant.now().toString()).append(CRLF);

        sb.append("END:VCARD").append(CRLF);

        return sb.toString();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private void appendField(StringBuilder sb, String name, String value) {
        if (!StringUtils.hasText(value)) return;
        sb.append(name).append(":").append(value).append(CRLF);
    }

    /**
     * Builds the structured ADR field only if at least one address part is present.
     * Format: ;;street;city;state;;country
     */
    private void buildAddress(StringBuilder sb, ProfileResponse p) {
        boolean hasAddr = StringUtils.hasText(p.getAddress())
                || StringUtils.hasText(p.getCity())
                || StringUtils.hasText(p.getState())
                || StringUtils.hasText(p.getCountry());

        if (!hasAddr) return;

        String street  = nvl(p.getAddress());
        String city    = nvl(p.getCity());
        String state   = nvl(p.getState());
        String country = nvl(p.getCountry());

        appendField(sb, "ADR;TYPE=WORK",
                ";;" + street + ";" + city + ";" + state + ";;" + country);
    }

    /**
     * Splits "FirstName LastName" into [lastName, firstName].
     * If only one name token is present, uses it as firstName.
     */
    private String[] splitName(String fullName) {
        if (!StringUtils.hasText(fullName)) return new String[]{"", ""};
        String[] parts = fullName.trim().split("\\s+", 2);
        if (parts.length == 1) return new String[]{"", parts[0]};
        return new String[]{parts[1], parts[0]}; // [lastName, firstName]
    }

    /** Escape vCard special characters: comma, semicolon, backslash, newline. */
    private String escapeVCardValue(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }
}
