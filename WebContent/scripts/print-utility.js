// Create a jquery plugin that prints the given element.
jQuery.fn.print = function () {
    // NOTE: We are trimming the jQuery collection down to the
    // first element in the collection.
    if (this.size() > 1) {
        this.eq(0).print();
        return;
    } else if (!this.size()) {
        return;
    }

    // Get a FRAMES reference to the new frame.
    var objFrame = window.frames["testPrint"];
    if(objFrame==undefined){
    	 // Create an iFrame with the new name.
    	jFrame = $("<iframe id='testPrint' name='testPrint'>");

        // Hide the frame (sort of) and attach to the body.
    	jFrame
            .css("width", "1px")
            .css("height", "1px")
            .css("position", "absolute")
            .css("left", "-9999px")
            .appendTo($("body:first"))
        ;
    	objFrame = window.frames["testPrint"];
    	
    	// Get a reference to the DOM in the new frame.
    	var objDoc = objFrame.document;
    	
    	// Grab all the style tags and copy to the new
        // document so that we capture look and feel of
        // the current document.Create a temp document DIV to hold the style tags.
       
        var jStyleDiv = $("<div>").append($("link[href*='main']").clone());
    	
        // Write the HTML for the document. In this, we will
        // write out the HTML of the current element.
        objDoc.open();
        objDoc.write("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">");
        objDoc.write("<html>");
        objDoc.write("<head>");
        objDoc.write("<title>");
        objDoc.write(document.title);
        objDoc.write("</title>");
        objDoc.write(jStyleDiv.html());
        objDoc.write("</head>");
        objDoc.write("<body>");
        objDoc.write(this.html());
        objDoc.write("</body>");
        objDoc.write("</html>");
        objDoc.close();
    	
    }else{
        // Get a reference to the DOM in the new frame.
        var objDoc = objFrame.document;
        objDoc.body.innerHTML=this.html();
    }
   
}