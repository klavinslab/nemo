# Nemo

Nemo is a VS Code Plugin for Editing and Testing Aquarium Protocols. See the [Aquarium Webpage](https://www.aquarium.bio/) for more information about Aquarium.

## Installation

1. Install and launch [Visual Studio Code](https://code.visualstudio.com/).
1. Download the extension package, currently `nemo-0.0.1.vsix`, from the Nemo github repository.
1. Click the Settings Gear in the lower left corner of VS Code and choose "Extensions".
1. At the top of the extensions sidebar, click the `...` button and choose "Install from VSIX..." and then find the nemo vsix package.
1. The **Aq** logo should show up on the left sidebar.
1. If you are running an instance of Aquarium locally on port 3000, then clicking the **Aq** logo should load the operation types and libraries from your instance.
1. If you are not running a local instance, or would like to connect to a different instance:
   - Click the Settings Gear and choose "Settings". Click "Extensions" and find Nemo.
   - Enter in your server URL, your username, and your password.
   - Then click on the **Aq** icon. You may need to click the Download button next to where it says "PACKAGE EXPLORER: AQUARIUM" to refresh the extension.

## Upgrading

As of this writing, to upgrade to a new version of Nemo, you need to uninstall the old version. To do so, first uninstall it via VS Code, then remove the installation directory. On a Mac, this directory would be at ~/.vscode/extensions/klavins-lab.nemo-\*

## Usage

### Editing Operation Type Code

Navigate to an operation type and click on the Protocol line.
This should fetch a copy of that operation type's protocol to your local computer and open it.
Once you have edited it, you can push it back to Aquarium by (a) saving it (e.g. do Ctrl-S or Cmd-S) and (b) clicking the upload button (an arrow pointing to the cloud).
The download button will re-download a copy, assuming your local copy was removed. The question mark button will display a little bit of information about the code.

### Testing Operation Types

Click on the Test line of an operation type. A simple test might look like this:

```ruby
class ProtocolTest < ProtocolTestBase

    def setup

        add_random_operations(3) # defines three random operations

        add_operation            # adds a custom made operation
          .with_input("Primer", Sample.find(3))
          .with_property("x", 123)
          .with_output("Primer", Sample.find(3))

    end

    def analyze
        log('Hello from Nemo')
        assert_equal(@backtrace.last[:operation], 'complete')
    end

end
```

The `ProtocolTestBase` class defines these methods:

- `add_random_operations(n)`: Creates n random operations to use to test the protocol.
- `add_operation`: Creates an operation of the operation type to the test.
- `log(msg)`: Save a message to the log for the test
- `operations_present?`: indicates whether there are operations in the test.
- `error?`: indicates whether execution of the operations resulted in an error.
- `error_message`: Returns the message if there is an error.
- `find_display_by_title(title)`: Returns a hash containing the output for a slide with the given title string.
- `displays_with_content`: Returns an array hashes representing the output slides of the test that are not empty.
- `displays`: Returns an array of hashes representing the output slides of the test.

You must define a `setup` method that defines the operations your test will use.
The `setup` method gets called before the protocol is executed.
Note that when you create operations, you can use the `set_input(input_name, value)

You must also define the `analyze` method, which will be called after the execution of the protocol has completed.
In it, you can access the @backtrace instance variable which will contain the backtrace of the job that was used in the test

`ProtocolTestBase` includes [MiniTest::Assertions](http://docs.seattlerb.org/minitest/Minitest/Assertions.html) such as `assert_equal` that you can use to assert things about the resulting backtrace.

## Development

To compile the single typescript file (will produce error messages):

```bash
tsc aquarium_tree_provider.ts -t 'ES5'
```

To start VS Code in development mode:

```bash
function code () { VSCODE_CWD="$PWD" open -n -b "com.microsoft.VSCode" --args $*; }
code .
```

[Note: _These instructions only work on a Mac_]

To build the package:

```bash
vsce package
```
