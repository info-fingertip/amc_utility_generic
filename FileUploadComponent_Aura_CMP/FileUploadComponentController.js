({
    doInit: function(component, event, helper) {
        // Add a small delay to ensure sectionName is set by parent
        window.setTimeout(
            $A.getCallback(function() {
                helper.loadFiles(component);
            }), 
            100
        );
    },
    
    handleUploadFinished: function(component, event, helper) {
        var uploadedFiles = event.getParam("files");
        var sectionName = component.get("v.sectionName");
        var maxFileCount = component.get("v.maxFileCount");
        var currentFiles = component.get("v.files");
        
        console.log('handleUploadFinished - sectionName:', sectionName);
        console.log('handleUploadFinished - uploadedFiles:', uploadedFiles);
        
        // Validate section name
        if(!sectionName || sectionName.trim() === '') {
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                title: "Error",
                message: "Please enter a section name before uploading files",
                type: "error"
            });
            toastEvent.fire();
            
            // Reload to remove the uploaded files from UI since we're rejecting them
            helper.loadFiles(component);
            return;
        }
        
        // Check file count limit
        if(maxFileCount > 0) {
            var totalFiles = currentFiles.length + uploadedFiles.length;
            if(totalFiles > maxFileCount) {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title: "Error",
                    message: "File limit exceeded! Maximum " + maxFileCount + " files allowed. You currently have " + currentFiles.length + " file(s).",
                    type: "error",
                    mode: "sticky"
                });
                toastEvent.fire();
                
                // Delete the uploaded files since they exceed the limit
                helper.deleteUploadedFiles(component, uploadedFiles);
                return;
            }
        }
        
        component.set("v.showSpinner", true);
        
        // Call helper to rename files - pass sectionName explicitly
        helper.renameUploadedFiles(component, uploadedFiles, sectionName);
    },
    
    handlePreview: function(component, event, helper) {
        var fileId = event.currentTarget.dataset.id || event.getSource().get("v.value");
        
        $A.get('e.lightning:openFiles').fire({
            recordIds: [fileId]
        });
    },
    
    handleDownload: function(component, event, helper) {
        var fileId = event.getSource().get("v.value");
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            "url": '/sfc/servlet.shepherd/document/download/' + fileId
        });
        urlEvent.fire();
    },
    
    handleDelete: function(component, event, helper) {
        var fileId = event.getSource().get("v.value");
        
        if (confirm('Are you sure you want to delete this file?')) {
            component.set("v.showSpinner", true);
            helper.deleteFile(component, fileId);
        }
    }
})