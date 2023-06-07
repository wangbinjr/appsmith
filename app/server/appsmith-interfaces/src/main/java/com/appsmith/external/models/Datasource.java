/* Copyright 2019-2023 Appsmith */
package com.appsmith.external.models;

import static com.appsmith.external.helpers.AppsmithBeanUtils.copyNestedNonNullProperties;

import com.appsmith.external.views.Views;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.util.CollectionUtils;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Document
public class Datasource extends BranchAwareDomain implements Forkable<Datasource> {

    @Transient public static final String DEFAULT_NAME_PREFIX = "Untitled datasource";

    @JsonView(Views.Public.class)
    String name;

    @JsonView(Views.Public.class)
    String pluginId;

    // name of the plugin. used to log analytics events where pluginName is a required attribute
    // It'll be null if not set
    @Transient
    @JsonView(Views.Public.class)
    String pluginName;

    // Organizations migrated to workspaces, kept the field as deprecated to support the old
    // migration
    @Deprecated
    @JsonView(Views.Public.class)
    String organizationId;

    @JsonView(Views.Public.class)
    String workspaceId;

    @JsonView(Views.Public.class)
    String templateName;

    @JsonView(Views.Public.class)
    DatasourceConfiguration datasourceConfiguration;

    @Transient
    @JsonView(Views.Internal.class)
    Map<String, DatasourceStorageDTO> datasourceStorages = new HashMap<>();

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonView(Views.Public.class)
    Set<String> invalids;

    /*
     * - To return useful hints to the user.
     * - These messages are generated by the API server based on the other datasource attributes.
     */
    @Transient
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonView(Views.Public.class)
    Set<String> messages = new HashSet<>();

    /*
     * This field is used to determine if the Datasource has been generated by the client or auto-generated by the system.
     * We use this field because when embedded datasources are null, spring-data auditable interfaces throw exceptions
     * while trying set createdAt and updatedAt properties on the null object
     */
    @Transient
    @JsonView(Views.Internal.class)
    Boolean isAutoGenerated = false;

    /*
     * This field is introduced as part of git sync feature, for the git import we will need to identify the datasource's
     * which are not configured. This way user can configure those datasource, which may have been introduced as part of git import.
     */
    @JsonView(Views.Public.class)
    Boolean isConfigured;

    @Transient
    @JsonView(Views.Public.class)
    Boolean isRecentlyCreated;

    /*
     * This field is meant to indicate whether the datasource is part of a template, or a copy of the same.
     * The field is not used anywhere in the codebase because templates are created directly in the DB, and the field
     * serves only as a DTO property.
     */
    @JsonView(Views.Public.class)
    Boolean isTemplate;

    /*
     * This field is meant to indicate whether the datasource is part of a mock DB, or a copy of the same.
     * The field is set during the creation of the mock db
     */
    @JsonView(Views.Public.class)
    Boolean isMock;

    @JsonView(Views.Internal.class)
    Boolean hasDatasourceStorage;

    // This is the only way to ever create a datasource. We are treating datasource as an internal
    // construct
    public Datasource(DatasourceStorage datasourceStorage) {
        this.setId(datasourceStorage.getDatasourceId());
        this.name = datasourceStorage.getName();
        this.pluginId = datasourceStorage.getPluginId();
        this.pluginName = datasourceStorage.getPluginName();
        this.workspaceId = datasourceStorage.getWorkspaceId();
        this.templateName = datasourceStorage.getTemplateName();
        this.isAutoGenerated = datasourceStorage.getIsAutoGenerated();
        this.isConfigured = datasourceStorage.getIsConfigured();
        this.isRecentlyCreated = datasourceStorage.getIsRecentlyCreated();
        this.isTemplate = datasourceStorage.getIsTemplate();
        this.isMock = datasourceStorage.getIsMock();
        this.gitSyncId = datasourceStorage.getGitSyncId();

        HashMap<String, DatasourceStorageDTO> storages = new HashMap<>();
        this.datasourceStorages = storages;
        if (datasourceStorage.getEnvironmentId() != null) {
            storages.put(
                    datasourceStorage.getEnvironmentId(),
                    new DatasourceStorageDTO(datasourceStorage));
        }
        this.hasDatasourceStorage = true;
    }

    /**
     * This method is here so that the JSON version of this class' instances have a `isValid` field,
     * for backwards compatibility. It may be removed, when sure that no API received is relying on
     * this field.
     *
     * @return boolean, indicating whether this datasource is valid or not.
     */
    @JsonView(Views.Public.class)
    public boolean getIsValid() {
        return CollectionUtils.isEmpty(invalids);
    }

    /**
     * Intended to function like `.equals`, but only semantically significant fields, except for the
     * ID. Semantically significant just means that if two datasource have same values for these
     * fields, actions against them will behave exactly the same.
     *
     * @return true if equal, false otherwise.
     */
    public boolean softEquals(Datasource other) {
        if (other == null) {
            return false;
        }

        return new EqualsBuilder()
                .append(name, other.name)
                .append(pluginId, other.pluginId)
                .append(isAutoGenerated, other.isAutoGenerated)
                .isEquals();
    }

    /**
     * This method defines the behaviour of a datasource when the application is forked from one
     * workspace to another. It creates a new object from the source datasource object Removes the
     * id and updated at from the object Based on forkWithConfiguration field present in the source
     * app, it sets the authentication for the datasource Returns the new datasource object
     */
    @Override
    public Datasource fork(Boolean forkWithConfiguration, String toWorkspaceId) {
        Datasource newDs = new Datasource();
        copyNestedNonNullProperties(this, newDs);
        newDs.makePristine();
        newDs.setWorkspaceId(toWorkspaceId);
        newDs.setDatasourceStorages(new HashMap<>());
        newDs.setIsConfigured(null);
        newDs.setInvalids(null);

        return newDs;
    }
}
