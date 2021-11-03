window.onload=function()
{
    // Get document elements to work with
    var file1 = document.getElementById("file_1");
    var file2 = document.getElementById("file_2");
    var label1 = document.getElementById("label_1");
    var label2 = document.getElementById("label_2");
    const compare = document.getElementById("compare");
    var document1 = document.getElementById("document_1");
    var document2 = document.getElementById("document_2");
    const reset = document.getElementById("reset");

    // Global variables
    var maxLines = 0;
    var minLines = 99999999;

    // Upload the first file
    file1.addEventListener("change", function()
    {
        // Let the user know they need to select a file if they haven't
        if(file1.value == "")
        {
            alert("No valid file selected");
            document1.innerHTML = "";
            return;
        }

        label1.setAttribute("disabled", true);
        file1.setAttribute("disabled", true);
        label1.innerText = "Document 1 [" + file1.value + "]";
        document1.style.display="inline-block";
        readTextFile(file1, document1, "1");
        removeLineFormatting();
    });

    // Uplod the second file
    file2.addEventListener("change", function()
    {
        if(file2.value == "")
        {
            alert("No valid file selected");
            document2.innerHTML = "";
            return;
        }

        label2.setAttribute("disabled", true);
        file2.setAttribute("disabled", true);
        label2.innerText = "Document 2 [" + file2.value + "]";
        document2.style.display="inline-block";
        readTextFile(file2, document2, "2");
        removeLineFormatting();
    });

    // Compare both files
    compare.addEventListener("click", function(e)
    {
        // We don't want to send any data anywhere, or reload the page
        e.preventDefault();
        e.stopPropagation();

        file1.setAttribute("disabled", true);
        file2.setAttribute("disabled", true);
        compare.setAttribute("disabled", true);
        reset.removeAttribute("disabled");
        
        // If a file hasn't been selected, stop!
        if(file1.value == "" || file2.value == "")
        {
            return;
        }

        // Create 2 Arrays
        var diff1 = Array();
        var diff2 = Array();

        // Loop through the lines in the documents, and add to the appropriate array
        for($i = 0; $i < maxLines; $i++)
        {
            if(document.getElementById("1-" + $i))
            {
                diff1[$i] = document.getElementById("1-" + $i).innerText;
            }
            if(document.getElementById("2-" + $i))
            {
                diff2[$i] = document.getElementById("2-" + $i).innerText;
            }
        }

        // Empty the documents
        document1.innerHTML = "";
        document2.innerHTML = "";

        for($i = 0; $i < minLines; $i++)
        {
            // Same Content
            if(diff1[$i] == diff2[$i])
            {
                writeLineToDocument(diff1[$i], document1, "1", $i, "same");
                writeLineToDocument(diff2[$i], document2, "2", $i, "same");
            }
            else
            {   
                // Construct the Line, Line Number, and Line Content for Document 1
                const dvl1 = document.createElement("div");
                dvl1.className = "documents__view__line";
                const dvln1 = document.createElement("div");
                dvln1.className = "documents__view__line__number";
                dvln1.innerText = parseInt($i + 1);
                const dvls1 = document.createElement("span");
                dvls1.classList.add("line");
                dvls1.classList.add("diff");
                dvls1.classList.add("document__1");

                // Construct the Line, Line Number, and Line Content for Document 2
                const dvl2 = document.createElement("div");
                dvl2.className = "documents__view__line";
                const dvln2 = document.createElement("div");
                dvln2.className = "documents__view__line__number";
                dvln2.innerText = parseInt($i + 1);
                const dvls2 = document.createElement("span");
                dvls2.classList.add("line");
                dvls2.classList.add("diff");
                dvls2.classList.add("document__1");

                // Create the individual chars of each line, and highlight the differences

                var maxLength = diff1[$i].length;
                if(diff2[$i].length > diff1[$i].length)
                {
                    maxLength = diff2[$i].length;
                }

                for($x = 0; $x < maxLength; $x++)
                {
                    if(diff1[$i].substring($x, $x + 1) == diff2[$i].substring($x, $x + 1))
                    {
                        dvls1.innerHTML += '<span class="char same">' + diff1[$i].substring($x, $x + 1) + '</span>';
                        dvls2.innerHTML += '<span class="char same">' + diff2[$i].substring($x, $x + 1) + '</span>';
                    }
                    else
                    {
                        dvls1.innerHTML += '<span class="char diff">' + diff1[$i].substring($x, $x + 1) + '</span>';
                        dvls2.innerHTML += '<span class="char diff">' + diff2[$i].substring($x, $x + 1) + '</span>';
                    }
                }

                // Add Line 1 to Document 1
                dvl1.appendChild(dvln1);
                dvl1.appendChild(dvls1);
                document1.appendChild(dvl1);

                // Add Line 2 to Document 2
                dvl2.appendChild(dvln2);
                dvl2.appendChild(dvls2);
                document2.appendChild(dvl2);
            }
        }

        // If one document has more lines than the other, show them as new lines
        if(minLines != maxLines)
        {
            for($i = minLines; $i < maxLines; $i++)
            {
                if(diff1[$i] !== undefined)
                {
                    writeLineToDocument(diff1[$i], document1, "1", $i, "new");
                }
                else
                {
                    writeLineToDocument(diff2[$i], document2, "2", $i, "new");
                }
            }
        }

    });

    // Reset the page
    reset.addEventListener("click", function()
    {
        window.location.reload();
    });

    // Read the files, add to an array, and write the results to the appropriate document panel
    function readTextFile(file, doc, id)
    {
        var thisFile = file.files[0];
        var reader = new FileReader();
        var diff = Array;
        doc.innerHTML = "";

        // Load the file
        reader.addEventListener('load', function(e)
        {
            let index = 0;

            // Split the lines into lines, then write each line to the document
            diff = e.target.result.split("\n");
            diff.forEach((line) =>
            {
                writeLineToDocument(line, doc, id, index)
                index++;
            });

            // Get the max/min line length
            if(diff.length > maxLines)
            {
                maxLines = diff.length;
            }
            if(diff.length < minLines)
            {
                minLines = diff.length;
            }
        });
        
        // Read the file
        reader.readAsBinaryString(thisFile);
    }

    // Ensure if we scroll Document 1, Document 2 follows
    document1.addEventListener("scroll", function()
    {
        document2.scrollTop = document1.scrollTop;
    })

    // Ensure if we scroll Document 2, Document 1 follows
    document2.addEventListener("scroll", function()
    {
        document1.scrollTop = document2.scrollTop;
    })

    // Remove the line formatting when loading a new file
    function removeLineFormatting()
    {
        // Remove formatting of lines
        const allLines = document.querySelectorAll(".line");
        allLines.forEach((line) =>
        {
            line.classList.remove("same");
            line.classList.remove("diff");
            line.classList.remove("new");
        });

        // Remove formatting of individual characters
        const allChars = document.querySelectorAll(".char");
        allChars.forEach((char) =>
        {
            char.classList.remove("diff");
        });
    }

    // Write the line to the document with the appropriate formatting
    function writeLineToDocument($line, $document, $id, $index, $classList = "")
    {
        // Create the Line
        var dvl = document.createElement("div");
        dvl.className = "documents__view__line";
        
        // Create the Line Number
        var dvln = document.createElement("div");
        dvln.className = "documents__view__line__number";
        dvln.innerText = parseInt($index + 1);

        // Create the Line content
        var span = document.createElement("span");
        span.classList.add("line");
        span.classList.add("document__" + $id);
        if($classList != "")
        {
            span.classList.add($classList);
        }
        span.innerText = $line;
        span.id = $id + "-" + $index;

        // Add the line number and content to the line, and add the line to the correct document
        dvl.appendChild(dvln);
        dvl.appendChild(span);
        $document.appendChild(dvl);
    }
}