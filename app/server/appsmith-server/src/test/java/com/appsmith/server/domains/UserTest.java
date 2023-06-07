/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.domains;

import static org.assertj.core.api.Assertions.assertThat;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;

@Slf4j
public class UserTest {

    @Test
    public void testFirstNameFromFullName() {
        User one = new User();
        one.setName("Sherlock Holmes");
        assertThat(one.computeFirstName()).isEqualTo("Sherlock");
    }

    @Test
    public void testFirstNameFromEmail() {
        User one = new User();
        one.setEmail("sherlock@gmail.com");
        assertThat(one.computeFirstName()).isEqualTo("sherlock");
    }

    @Test
    public void testFirstNameFromFullNameAndEmail() {
        User one = new User();
        one.setName("Sherlock Holmes");
        one.setEmail("sherlock@gmail.com");
        assertThat(one.computeFirstName()).isEqualTo("Sherlock");
    }
}
