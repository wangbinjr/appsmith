/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.repositories.ce;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.User;
import com.appsmith.server.repositories.AppsmithRepository;
import java.util.Set;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CustomUserRepositoryCE extends AppsmithRepository<User> {

    Mono<User> findByEmail(String email, AclPermission aclPermission);

    Flux<User> findAllByEmails(Set<String> emails);

    Mono<User> findByCaseInsensitiveEmail(String email);

    Mono<User> findByEmailAndTenantId(String email, String tenantId);

    Mono<Boolean> isUsersEmpty();
}
