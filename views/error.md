- <span style="color: red">Error: <%= error.message %></span>
<% for ( var j=0; j<error.backtrace.length; j++ ) { %>
    - <%= error.backtrace[j] _%>
<% } %>