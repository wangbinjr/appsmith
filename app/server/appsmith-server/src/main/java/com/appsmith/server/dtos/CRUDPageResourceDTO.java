/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.dtos;

import java.util.Map;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * This class will hold the fields that will be consumed by the server, which will be received
 * from the clients request body
 */
@NoArgsConstructor
@Getter
@Setter
public class CRUDPageResourceDTO {

    // This will be defaultApplicationId if the application is connected with git
    String applicationId;

    String datasourceId;

    String tableName;

    String searchColumn;

    Set<String> columns;

    Map<String, String> pluginSpecificParams;
}
