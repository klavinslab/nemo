# Nemo: A VS Code Plugin for Editing and Testing Aquarium Protocols

See https://www.aquarium.bio for more information.

To start VS Code in development mode:

    function code () { VSCODE_CWD="$PWD" open -n -b "com.microsoft.VSCode" --args $*; }
    code .

# Logic

When Nemo is activated it gets a list of operation types. The following state machine determines how the code associated with each one is managed.

