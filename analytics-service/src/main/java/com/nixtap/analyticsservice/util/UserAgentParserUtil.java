package com.nixtap.analyticsservice.util;

/**
 * Utility class for parsing raw HTTP User-Agent strings into standardised
 * device type and browser category strings used by the analytics domain.
 *
 * All parsing uses case-insensitive substring matching — no third-party library
 * is required. Detection order follows UA string specificity rules:
 *   1. Tablet check comes before mobile (tablets also contain "mobile" substrings
 *      on some platforms).
 *   2. Edge check comes before Chrome (Edge UA strings contain "Chrome").
 *   3. Safari check comes after Chrome/Edge to avoid false-positives.
 */
public final class UserAgentParserUtil {

    // Prevent instantiation
    private UserAgentParserUtil() {}

    // -----------------------------------------------------------------------
    // Device-type constants
    // -----------------------------------------------------------------------

    public static final String DEVICE_MOBILE  = "MOBILE";
    public static final String DEVICE_TABLET  = "TABLET";
    public static final String DEVICE_DESKTOP = "DESKTOP";
    public static final String DEVICE_UNKNOWN = "UNKNOWN";

    // -----------------------------------------------------------------------
    // Browser constants
    // -----------------------------------------------------------------------

    public static final String BROWSER_CHROME  = "CHROME";
    public static final String BROWSER_SAFARI  = "SAFARI";
    public static final String BROWSER_FIREFOX = "FIREFOX";
    public static final String BROWSER_EDGE    = "EDGE";
    public static final String BROWSER_OTHER   = "OTHER";

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Parses the raw User-Agent string and returns a standardised device type.
     *
     * @param userAgent raw User-Agent header value (may be null or blank)
     * @return one of: MOBILE, TABLET, DESKTOP, UNKNOWN
     */
    public static String parseDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return DEVICE_UNKNOWN;
        }
        String ua = userAgent.toLowerCase();

        // Tablet check first — many tablet UAs also contain "mobile"
        if (ua.contains("tablet")
                || ua.contains("ipad")
                || (ua.contains("android") && !ua.contains("mobile"))) {
            return DEVICE_TABLET;
        }

        if (ua.contains("mobile")
                || ua.contains("iphone")
                || ua.contains("ipod")
                || ua.contains("windows phone")
                || ua.contains("blackberry")
                || ua.contains("nokia")) {
            return DEVICE_MOBILE;
        }

        // Anything else with a recognisable OS signature is desktop
        if (ua.contains("windows")
                || ua.contains("macintosh")
                || ua.contains("linux")
                || ua.contains("x11")) {
            return DEVICE_DESKTOP;
        }

        return DEVICE_UNKNOWN;
    }

    /**
     * Parses the raw User-Agent string and returns a standardised browser name.
     *
     * @param userAgent raw User-Agent header value (may be null or blank)
     * @return one of: CHROME, SAFARI, FIREFOX, EDGE, OTHER
     */
    public static String parseBrowser(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return BROWSER_OTHER;
        }
        String ua = userAgent.toLowerCase();

        // Firefox is distinct — check before Chrome
        if (ua.contains("firefox") || ua.contains("fxios")) {
            return BROWSER_FIREFOX;
        }

        // Edge must come before Chrome because Edge UA also contains "chrome"
        if (ua.contains("edg/") || ua.contains("edge/") || ua.contains("edgios")) {
            return BROWSER_EDGE;
        }

        // Chrome (and Chrome-based browsers such as Opera, Brave)
        // Exclude Safari-only UAs which also contain "applewebkit"
        if (ua.contains("chrome") || ua.contains("crios")) {
            return BROWSER_CHROME;
        }

        // Safari — contains "safari" but NOT "chrome" or "crios"
        if (ua.contains("safari")) {
            return BROWSER_SAFARI;
        }

        return BROWSER_OTHER;
    }
}
