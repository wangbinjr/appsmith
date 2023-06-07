/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.domains;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DatasourceContext<T> {
    T connection;

    Instant creationTime;

    public DatasourceContext() {
        creationTime = Instant.now();
    }
}
