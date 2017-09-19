<ul class="CDB-Dropdown-list CDB-Text CDB-Size-medium">

  <% if (flags.canCollapse) { %>
    <li class="CDB-Dropdown-item">
      <button class="CDB-Dropdown-link js-toggleCollapsed">
        小部件开关
          <div class="CDB-Dropdown-toggle">
          <% if (collapsed) { %>
            <input class="CDB-Toggle js-inputCollapsed" checked="checked" type="checkbox" name="collapsed">
          <% } else { %>
            <input class="CDB-Toggle js-inputCollapsed" type="checkbox" name="collapsed">
          <% } %>
            <span class="u-iBlock CDB-ToggleFace"></span>
          </div>
      </button>
    </li>
  <% } %>

  <% if (flags.localTimezone) { %>
  <li class="CDB-Dropdown-item">
    <button class="CDB-Dropdown-link js-toggleLocalTimezone">
      本地时区
      <div class="CDB-Dropdown-toggle">
        <% if (local_timezone) { %>
          <input class="CDB-Toggle u-iBlock js-localTimezone" checked="checked" type="checkbox" name="localtimezone">
        <% } else { %>
          <input class="CDB-Toggle u-iBlock js-localTimezone" type="checkbox" name="localtimezone">
        <% } %>
        <span class="u-iBlock CDB-ToggleFace"></span>
      </div>
    </button>
  </li>
  <% } %>

  <% if (flags.normalizeHistogram) { %>
  <li class="CDB-Dropdown-item">
    <button class="CDB-Dropdown-link js-toggleNormalized">
      显示统计
      <div class="CDB-Dropdown-toggle">
        <% if (normalized) { %>
          <input class="CDB-Toggle u-iBlock js-inputNormalized" type="checkbox" name="normalized">
        <% } else { %>
          <input class="CDB-Toggle u-iBlock js-inputNormalized" checked="checked" type="checkbox" name="normalized">
        <% } %>
        <span class="u-iBlock CDB-ToggleFace"></span>
      </div>
    </button>
  </li>
  <% } %>

  <% if (show_options) { %>
    <li class="CDB-Dropdown-item">
      <button type="button" class="CDB-Dropdown-link u-ellipsis u-actionTextColor js-editWidget" title="Edit">编辑</button>
    </li>
    <li class="CDB-Dropdown-item">
      <button type="button" class="CDB-Dropdown-link u-ellipsis u-errorTextColor js-removeWidget" title="Delete...">删除...</button>
    </li>
  <% } %>
</ul>
