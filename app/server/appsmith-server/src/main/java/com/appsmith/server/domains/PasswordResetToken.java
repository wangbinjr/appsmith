/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.domains;

import com.appsmith.external.models.BaseDomain;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Document
public class PasswordResetToken extends BaseDomain {
    String tokenHash;
    String email;
    int requestCount; // number of requests in last 24 hours
    Instant firstRequestTime; // when a request was first generated in last 24 hours
}
