/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.services.ce;

import com.appsmith.server.domains.CustomJSLib;
import com.appsmith.server.dtos.CustomJSLibApplicationDTO;
import com.appsmith.server.services.CrudService;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Set;
import reactor.core.publisher.Mono;

public interface CustomJSLibServiceCE extends CrudService<CustomJSLib, String> {
    Mono<Boolean> addJSLibToApplication(
            @NotNull String applicationId, @NotNull CustomJSLib jsLib, String branchName, Boolean isForceInstall);

    Mono<Boolean> removeJSLibFromApplication(
            @NotNull String applicationId, @NotNull CustomJSLib jsLib, String branchName, Boolean isForceRemove);

    Mono<List<CustomJSLib>> getAllJSLibsInApplication(
            @NotNull String applicationId, String branchName, Boolean isViewMode);

    Mono<List<CustomJSLib>> getAllJSLibsInApplicationForExport(
            @NotNull String applicationId, String branchName, Boolean isViewMode);

    Mono<Set<CustomJSLibApplicationDTO>> getAllJSLibApplicationDTOFromApplication(
            @NotNull String applicationId, String branchName, Boolean isViewMode);

    Mono<CustomJSLibApplicationDTO> persistCustomJSLibMetaDataIfDoesNotExistAndGetDTO(
            CustomJSLib jsLib, Boolean isForceInstall);
}
