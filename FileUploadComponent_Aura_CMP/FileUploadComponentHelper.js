({
    renameUploadedFiles: function(component, uploadedFiles, sectionName) {
        console.log('renameUploadedFiles - sectionName:', sectionName);
        
        var action = component.get("c.renameFiles");
        var fileIds = [];
        
        // Extract ContentDocumentIds from uploaded files
        for(var i = 0; i < uploadedFiles.length; i++) {
            fileIds.push(uploadedFiles[i].documentId);
        }
        
        action.setParams({
            contentDocumentIds: fileIds,
            sectionName: sectionName
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if (state === "SUCCESS") {
                // Wait a bit for Salesforce to process the rename, then reload
                // Store sectionName before setTimeout to ensure it's captured
                var currentSection = component.get("v.sectionName");
                console.log('After rename success - sectionName:', currentSection);
                
                window.setTimeout(
                    $A.getCallback(function() {
                        // Verify sectionName hasn't changed
                        var verifySection = component.get("v.sectionName");
                        console.log('Before loadFiles - sectionName:', verifySection);
                        
                        component.set("v.showSpinner", false);
                        this.loadFiles(component);
                        this.showToast("Success", uploadedFiles.length + " file(s) uploaded and renamed successfully", "success");
                    }.bind(this)), 
                    500 // Wait 500ms for rename to process
                );
            } else if (state === "ERROR") {
                component.set("v.showSpinner", false);
                var errors = response.getError();
                var message = 'Unknown error';
                if (errors && errors[0] && errors[0].message) {
                    message = errors[0].message;
                }
                this.showToast("Error", message, "error");
            }
        });
        
        $A.enqueueAction(action);
    },
    
    loadFiles: function(component) {
        component.set("v.showSpinner", true);
        
        var action = component.get("c.getFiles");
        var sectionName = component.get("v.sectionName");
        
        console.log('loadFiles called - sectionName:', sectionName);
        console.log('loadFiles called - recordId:', component.get("v.recordId"));
        
        action.setParams({
            recordId: component.get("v.recordId"),
            sectionName: sectionName
        });
        
        action.setCallback(this, function(response) {
            component.set("v.showSpinner", false);
            var state = response.getState();
            
            if (state === "SUCCESS") {
                var files = response.getReturnValue();
                console.log('loadFiles response - files:', files);
                console.log('loadFiles response - file count:', files.length);
                component.set("v.files", files);
            } else if (state === "ERROR") {
                var errors = response.getError();
                var message = 'Unknown error';
                if (errors && errors[0] && errors[0].message) {
                    message = errors[0].message;
                }
                this.showToast("Error", message, "error");
            }
        });
        
        $A.enqueueAction(action);
    },
    
    deleteFile: function(component, fileId) {
        var action = component.get("c.deleteFile");
        action.setParams({
            contentDocumentId: fileId
        });
        
        action.setCallback(this, function(response) {
            component.set("v.showSpinner", false);
            var state = response.getState();
            
            if (state === "SUCCESS") {
                this.showToast("Success", "File deleted successfully", "success");
                this.loadFiles(component);
            } else if (state === "ERROR") {
                var errors = response.getError();
                var message = 'Unknown error';
                if (errors && errors[0] && errors[0].message) {
                    message = errors[0].message;
                }
                this.showToast("Error", message, "error");
            }
        });
        
        $A.enqueueAction(action);
    },
    
    deleteUploadedFiles: function(component, uploadedFiles) {
        component.set("v.showSpinner", true);
        
        // Delete each uploaded file
        var fileIds = [];
        for(var i = 0; i < uploadedFiles.length; i++) {
            fileIds.push(uploadedFiles[i].documentId);
        }
        
        var action = component.get("c.deleteMultipleFiles");
        action.setParams({
            contentDocumentIds: fileIds
        });
        
        action.setCallback(this, function(response) {
            component.set("v.showSpinner", false);
            var state = response.getState();
            
            if (state === "SUCCESS") {
                this.loadFiles(component);
            } else if (state === "ERROR") {
                var errors = response.getError();
                var message = 'Unknown error';
                if (errors && errors[0] && errors[0].message) {
                    message = errors[0].message;
                }
                this.showToast("Error", message, "error");
                this.loadFiles(component);
            }
        });
        
        $A.enqueueAction(action);
    },
    
    showToast: function(title, message, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type
        });
        toastEvent.fire();
    }
})