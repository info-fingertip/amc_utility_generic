/****************************************************************
* Class Name   : fileUploadController
* Company      : Fingertipplus
* Created Date : 13-11-2025
* @description : This class handles file upload operations for Vertical Master records.
*                Supports multiple file sections (Manual and Other Files)
*                with section-based tagging and deletion capabilities.
* @author      : Dhanush
* Used By      : - fileUpload.cmp
*                - fileUploadHelper.js
* Change Log:
* -----------------------------------------------------------------------------
* Ver | Author      | Date       | Description
* -----------------------------------------------------------------------------
* 1.0 | Dhanush | 19-11-2025 | Initial version with file upload/delete
* -----------------------------------------------------------------------------
**************************************************************/
public with sharing class fileUploadController {
    
    // Constants for maximum records
    private static final Integer MAX_QUERY_LIMIT = 10000;
    
    /**
     * Method Name  : getFiles
     * @description : Retrieves all files associated with a record filtered by section name.
     *                Files are identified by having '_section' suffix in their title.
     * @param       : Id recordId - The record Id to fetch files for
     *                String section - The section name to filter files (manual, otherFiles)
     * @return      : List<FileWrapper> - List of file metadata wrapped in custom wrapper class
     */
    @AuraEnabled
    public static List<FileWrapper> getFiles(Id recordId, String section) {
        // Validate input parameters
        if(recordId == null || String.isBlank(section)) {
            return new List<FileWrapper>();
        }

        // Create filter pattern for the section suffix
        String filterName = '%_' + section;
        
        // Query ContentDocumentLinks to get files associated with the record
        List<ContentDocumentLink> links = [
            SELECT ContentDocument.Id,
                   ContentDocument.Title,
                   ContentDocument.CreatedDate,
                   ContentDocument.LatestPublishedVersionId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :recordId
            ORDER BY ContentDocument.CreatedDate DESC
        ];

        // Collect all document IDs from the links
        Set<Id> documentIds = new Set<Id>();
        for(ContentDocumentLink link : links) {
            documentIds.add(link.ContentDocumentId);
        }

        // Filter ContentDocuments by title pattern matching section name
        List<ContentDocument> documents = [
            SELECT Id, Title, CreatedDate, LatestPublishedVersionId
            FROM ContentDocument 
            WHERE Id IN :documentIds 
            AND Title LIKE :filterName
        ];

        // Convert ContentDocuments to FileWrapper objects
        List<FileWrapper> files = new List<FileWrapper>();
        for(ContentDocument doc : documents) {
            files.add(new FileWrapper(
                doc.Title,
                doc.Id,
                String.valueOf(doc.CreatedDate),
                doc.LatestPublishedVersionId
            ));
        }
        
        return files;
    }

    /**
     * Method Name  : tagFilesWithSection
     * @description : Tags uploaded files with section suffix by appending '_section' to file title.
     *                This allows categorization of files into different sections.
     * @param       : List<Id> fileIds - List of ContentDocument IDs to tag
     *                String section - Section name to append to file titles
     *                Id recordId - The parent record Id (currently unused but for future enhancement)
     * @return      : void
     */
    @AuraEnabled
    public static void tagFilesWithSection(List<Id> fileIds, String section, Id recordId) {
        // Validate input parameters
        if(fileIds == null || fileIds.isEmpty() || String.isBlank(section)) {
            return;
        }

        // Query ContentDocuments for the given file IDs
        List<ContentDocument> documents = [
            SELECT Id, Title 
            FROM ContentDocument 
            WHERE Id IN :fileIds
        ];

        // Add section suffix to each document title if not already present
        for(ContentDocument doc : documents) {
            if(!doc.Title.endsWith('_' + section)) {
                doc.Title = doc.Title + '_' + section;
            }
        }

        // Bulk update all documents at once (avoiding DML in loop)
        if(!documents.isEmpty()) {
            update documents;
        }
    }

    /**
     * Method Name  : deleteFileAndLinks
     * @description : Deletes a ContentDocument and its associated ContentDocumentLinks.
     *                Performs cascade deletion of all related links automatically.
     * @param       : Id contentDocumentId - The ContentDocument Id to delete
     *                Id recordId - The parent record Id (for logging/validation purposes)
     * @return      : Map<String, Object> - Result map containing success flag and message
     */
    @AuraEnabled
    public static Map<String, Object> deleteFileAndLinks(Id contentDocumentId, Id recordId) {
        // Initialize result map
        Map<String, Object> result = new Map<String, Object>{
            'success' => false,
            'message' => ''
        };

        // Validate ContentDocument Id
        if(contentDocumentId == null) {
            result.put('message', 'Invalid ContentDocument Id.');
            return result;
        }

        try {
            // Query ContentDocument to verify it exists
            List<ContentDocument> contentDocuments = [
                SELECT Id 
                FROM ContentDocument 
                WHERE Id = :contentDocumentId 
                LIMIT 1
            ];
            
            // Delete the ContentDocument (ContentDocumentLinks cascade delete automatically)
            if(!contentDocuments.isEmpty()) {
                delete contentDocuments;
                result.put('message', 'File deleted successfully.');
                result.put('success', true);
            } else {
                result.put('message', 'File not found.');
            }

            return result;
            
        } catch(Exception ex) {
            // Handle any exceptions during deletion
            result.put('message', 'Failed to delete file: ' + ex.getMessage());
            result.put('success', false);
            return result;
        }
    }
    
    /**
     * Inner Class Name : FileWrapper
     * @description     : Wrapper class to hold file metadata for display in Lightning component.
     *                    Provides simplified file information structure.
     */
    public class FileWrapper {
        @AuraEnabled public String name;          // File name/title
        @AuraEnabled public String documentId;    // ContentDocument Id
        @AuraEnabled public String uploadDate;    // Creation date as string
        @AuraEnabled public Id versionId;         // Latest published version Id for download URL

        /**
         * Constructor    : FileWrapper
         * @description   : Initializes FileWrapper with file metadata
         * @param         : String fileName - The file name
         *                  String docId - The ContentDocument Id
         *                  String uploadDateStr - Upload date as string
         *                  Id verId - Latest published version Id
         */
        public FileWrapper(String fileName, String docId, String uploadDateStr, Id verId) {
            this.name = fileName;
            this.documentId = docId;
            this.uploadDate = uploadDateStr;
            this.versionId = verId;
        }
    }
}