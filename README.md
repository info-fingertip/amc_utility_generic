# amc_utility_generic
Generic utility library for AMC (Asset Management Center) with reusable Apex utilities, helpers, and common functions for Salesforce applications

# AMC Utility Generic

A comprehensive utility library providing reusable Apex components, helper classes, and common functions for AMC (Asset Management Center) Salesforce applications.

## Overview

This repository contains generic utility classes and methods that can be leveraged across multiple AMC projects to reduce code duplication, improve maintainability, and accelerate development.

## Features

- 🔧 **Common Utilities**: String manipulation, date formatting, data validation
- 📊 **Data Helpers**: Query builders, bulk processing utilities, CSV/Excel handlers
- 🔐 **Security Utils**: Field-level security checks, sharing rule helpers
- 📧 **Communication Tools**: Email templates, SMS integration, notification handlers
- 🎯 **Business Logic**: Custom calculation methods, workflow automation helpers
- 🧪 **Test Utilities**: Mock data generators, test data factories

## Key Components

- `StringUtils.cls` - String manipulation and validation
- `DateUtils.cls` - Date/time formatting and calculations
- `QueryBuilder.cls` - Dynamic SOQL query construction
- `ValidationHelper.cls` - Common validation methods
- `EmailHelper.cls` - Email sending utilities
- `RecordTypeHelper.cls` - RecordType caching and retrieval
- `PermissionChecker.cls` - FLS and CRUD permission validation

## Installation

1. Clone the repository
2. Deploy to your Salesforce org using your preferred deployment tool
3. Grant necessary permissions to user profiles

## Usage
```apex
// Example: String validation
if(StringUtils.isValidEmail('user@example.com')) {
    // Process email
}

// Example: Date formatting
String formattedDate = DateUtils.formatDate(Date.today(), 'dd-MM-yyyy');

// Example: Permission check
if(PermissionChecker.hasFieldAccess('Account', 'Industry', 'READ')) {
    // Access field
}
```

## Requirements

- Salesforce API Version: 58.0 or higher
- Apex Language Version: 58.0+

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Write comprehensive test coverage (minimum 85%)
4. Submit a pull request with detailed description

## License

[Your License Here - e.g., MIT, Apache 2.0]

## Maintainers

- Rakesh (@rakesh)
- [Add team members]

## Change Log

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.
```

---

## Alternative Short Descriptions (pick one):

**Option 1 (Technical):**
```
Reusable Apex utility library for AMC Salesforce projects - Common helpers, validators, and generic functions
```

**Option 2 (Business-focused):**
```
Centralized utility repository for Asset Management Center (AMC) with shared Salesforce components and helpers
```

**Option 3 (Developer-focused):**
```
Generic Apex utilities and helper classes for AMC projects - DRY principles, reusable components, accelerated development
```

**Option 4 (Comprehensive):**
```
AMC Generic Utilities: Shared Apex library with common helpers, validators, query builders, and business logic components for Salesforce
