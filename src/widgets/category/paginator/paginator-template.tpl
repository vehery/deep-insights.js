<% if (showSearch) { %>
<div class="CDB-Widget-contentFlex">
  <button class="u-rSpace--m CDB-Text is-semibold u-upperCase CDB-Size-small js-searchToggle">
    <div class="CDB-Shape u-iBlock">
      <span class="CDB-Shape-magnify is-small is-blue"></span>
    </div>
    <span class="u-iBlock u-actionTextColor">
      search in <%- categoriesCount %> categor<%- categoriesCount === 1 ? 'y' : 'ies' %>
    </span>
  </button>
</div>
<% } %>
<% if (showPaginator) { %>
  <div class="CDB-Widget-navDots js-dots">
    <% for (var i = 0, l = pages; i < l; i++) { %><button class="CDB-Shape-dot CDB-Widget-dot--navigation js-page <% if (currentPage === i) { %>is-selected<% } %>" data-page="<%- i %>"></button><% } %>
  </div>
<% } %>
