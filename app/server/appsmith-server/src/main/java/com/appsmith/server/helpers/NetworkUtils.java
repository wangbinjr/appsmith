/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.helpers;

import com.appsmith.util.WebClientUtils;
import java.net.URI;
import reactor.core.publisher.Mono;

public class NetworkUtils {

    private static final URI GET_IP_URI = URI.create("https://api64.ipify.org");

    private static String cachedAddress = null;

    private NetworkUtils() {}

    /**
     * This method hits an API endpoint that returns the external IP address of this server instance.
     *
     * @return A publisher that yields the IP address.
     */
    public static Mono<String> getExternalAddress() {
        if (cachedAddress != null) {
            return Mono.just(cachedAddress);
        }

        return WebClientUtils.create()
                .get()
                .uri(GET_IP_URI)
                .retrieve()
                .bodyToMono(String.class)
                .map(address -> {
                    cachedAddress = address;
                    return address;
                });
    }
}
