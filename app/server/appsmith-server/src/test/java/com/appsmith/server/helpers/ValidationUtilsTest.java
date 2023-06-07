/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.helpers;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

public class ValidationUtilsTest {

    @Test
    public void validateEmailCsv() {
        assertThat(ValidationUtils.validateEmailCsv("")).isFalse();
        assertThat(ValidationUtils.validateEmailCsv(null)).isFalse();
        assertThat(ValidationUtils.validateEmailCsv(" ")).isFalse();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com")).isTrue();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com,a@appsmith.com"))
                .isTrue();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com, b@appsmith.com"))
                .isTrue();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com , a@appsmith.com"))
                .isTrue();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com  ,  a@appsmith.com"))
                .isTrue();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com  ,  b@appsmith.com ,c@appsmith.com"))
                .isTrue();
        assertThat(ValidationUtils.validateEmailCsv(" a@appsmith.com , b@appsmith.com "))
                .isTrue();

        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com,a@appsmith.com,xyz"))
                .isFalse();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com,b@appsmith.com,,"))
                .isFalse();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com,b@appsmith.com, "))
                .isFalse();
        assertThat(ValidationUtils.validateEmailCsv(",,")).isFalse();
        assertThat(ValidationUtils.validateEmailCsv(",")).isFalse();
        assertThat(ValidationUtils.validateEmailCsv("a@appsmith.com,,")).isFalse();
    }
}
