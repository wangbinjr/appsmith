/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.converters;

import static java.time.format.DateTimeFormatter.ISO_DATE_TIME;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import org.springframework.core.convert.converter.Converter;

public class StringToInstantConverter implements Converter<String, Instant> {
    @Override
    public Instant convert(String s) {
        try {
            LocalDateTime ldt = LocalDateTime.parse(s, ISO_DATE_TIME);
            return ldt.toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
