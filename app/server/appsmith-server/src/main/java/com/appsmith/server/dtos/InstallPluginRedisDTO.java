/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InstallPluginRedisDTO {
    String workspaceId;
    PluginWorkspaceDTO pluginWorkspaceDTO;
}
