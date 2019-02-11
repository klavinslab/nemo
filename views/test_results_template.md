Test Results
===

<% if ( results.result == "error" ) { %>
<span style="color: red"><%= results.message %></span>
<% } else { %>
<span style="color: green">All tests passed.</span>
<% } %>

Log
---
<% for ( var i=0; i<results.log.length; i++ ) { %>
- <%= results.log[i] %>
<% } %>

Backtrace
---
<% for ( var i=1; i<results.backtrace.length; i += 2 ) { %>
<%   if ( results.backtrace[i].operation == "display" ) { %>
**<%= results.backtrace[i-1].time %>**
<%     let lines = results.backtrace[i].content; %>
<%     for ( var j=0; j<lines.length; j++ ) { %>
- <%= JSON.stringify(lines[j]) %>
<%     } %>
<%   } else if ( results.backtrace[i].operation == "error" ) { %>
<%- include( 'error.md', { error: results.backtrace[i] } ) %>
<%   } %>
<% } %>