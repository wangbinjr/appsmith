/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.domains;

import com.appsmith.external.models.BaseDomain;
import com.appsmith.server.dtos.Permission;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Document
@NoArgsConstructor
@Getter
@Setter
public class PermissionGroup extends BaseDomain {

    @NotNull String name;

    String tenantId;

    String description;

    // TODO: refactor this to defaultDocumentId, as we can use this to store associated document id
    // for
    // which we are auto creating this permission group.
    @Deprecated String defaultWorkspaceId;

    String defaultDomainId;
    String defaultDomainType;

    @Deprecated Set<Permission> permissions = new HashSet<>();

    Set<String> assignedToUserIds = new HashSet<>();

    Set<String> assignedToGroupIds = new HashSet<>();
}
