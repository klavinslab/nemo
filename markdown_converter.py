import os
import glob
import re
import json

def convert_markdown(filename):
    newlines = []

    with open(filename, 'r') as f:
        lines = f.readlines()

    showpat = re.compile(r"- {\"([a-z]+)\":\"(.+)\"}$")
    tablepat = re.compile(r"- {\"table\":(\[.+\])}$")
    stamppat = re.compile(r"\*\*.+\*\*$")
    seppat = re.compile(r"- {\"separator\".+}$")

    for line in lines:
        line = re.sub("<span[^<>]+>", "", line)
        line = re.sub("</span>", "", line)
        showmatch = showpat.match(line)
        tablematch = tablepat.match(line)
        stampmatch = stamppat.match(line)
        sepmatch = seppat.match(line)

        if showmatch:
            showtype = showmatch.group(1)
            content = showmatch.group(2)
            if showtype == "title":
                newlines.append("## " + content)
            else:
                newlines.append(content)

            newlines.append("\n\n")

        elif tablematch:
            content = tablematch.group(1)
            newlines += format_table(content)
            newlines.append("\n\n")

        elif stampmatch:
            newlines.append("---\n---\n")

        elif sepmatch:
            newlines.append("-"*10 + "\n\n")

        else:
            newlines.append(line)

    with open(filename, 'w') as f:
        f.writelines(newlines)

def format_table(content):
    formatted = ["<table>"]
    ary = json.loads(content)
    style = "border: 1px solid gray; text-align: center"
    for row in ary:
        newrow = ""
        for cell in row:
            this_style = style

            if isinstance(cell, dict):
                newcell = cell.get("content") or "?"
                if cell.get("class") == "td-filled-slot":
                    this_style = style + "; background-color: lightskyblue"

            else:
                newcell = cell

            newrow += "<td style=\"{}\">{}</td>".format(this_style, newcell)
        formatted.append("<tr>{}</tr>".format(newrow))

    formatted.append("</table>")
    return formatted

for filename in glob.iglob('**/test_results.md', recursive=True):
    print(convert_markdown(filename))
