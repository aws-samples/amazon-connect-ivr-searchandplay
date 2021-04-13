# Call Recording Identity Summary
The Identity configuration for the Call Recording application comprises of Cognito and a hosted ADFS service.
Configuration will enable users that are a member of an AD group to access the application.
ADFS will present the AD group names as part of the SAML asseration. Amazon Cognito will be configured to map the AD group name to an IAM Role that is allowed to invoke the required API's

# Call Recording Cognito Deployment

The Call Recording application uses Cognito to enables SSO log in to the application and map Tabcorp Active Directory groups to IAM Roles defined with the Cognito Configuration.

This CFN template deploys the below resources and is located in the ./cfn/cognito/ folder of the repo.

1. Cognito User Pool
2. Cognito User Pool Domain
3. Cognito User Pool App Client
4. Cognito Identity Pool
5. Cognito Identity Pool AD Group to IAM Role Mapping Rules
6. IAM Roles for UnAuthenticated Access and Authenticated Access

The User Pool Identity Federation Configuration needs to be applied after the ADFS configuration has been completed
See here for reference - https://aws.amazon.com/blogs/mobile/building-adfs-federation-for-your-web-app-using-amazon-cognito-user-pools

## Cognito CFN Deployment
To deploy the defined CFN template the below needs to be defined as input params

 - UserPoolName
 - UserPoolIDName
 - AppClientName
 - AuthRoleName
 - UnAuthRoleName
 - IdentityPoolName
 - UserPoolDomainName
 - AWS Region being used

### Updates required to the CFN Template
Below are updates required to the CFN template to ensure the template will function within the specified environment

1. pMetadataURL: This needs to be updated with the correct ADFS url for your ADFS deployment 

2. pCallBackURL & pLogoutUrl Parameters. These Strings need to be updated the relevant URLs for the Call Recording application

3. pADGroup, this is the AD group that is being configured for the Cognito Role Mapping. Enter the full name fo the AD group here,.

## ADFS Configuration
To enable ADFS to present the required attributes to Cognito

1. The Relaying Party Trust must be configured with the relying party trust identifier set as  "urn:amazon:cognito:sp:user-pool-id"
2. The SAML 2.0 post-binding endpoint will be set as the domain name configured
'https://<domain-prefix>.auth.ap-southeast-2.amazoncognito.com/saml2/idpresponse'

<domain-prefix> This needs to be defined by Tabcorp. It is a 'friendlyname' E.g. callrecording

### Blog Post Reference

For more detailed steps on ADFS to Cognito Configuration review the blog post:
https://aws.amazon.com/blogs/mobile/building-adfs-federation-for-your-web-app-using-amazon-cognito-user-pools


### ADFS Rules Configuration
ADFS Claim rules need to be defined to enable certain attributes to be passed to Amazon Cognito.
For the Call Recording application the below rules have been defined to pass the required attributes to Amazon Cognito

When the relaying party trust has been configured the below rules need to be configured.

![ADFS Claim Rules Screenshot](/images/samlrules.png)

#### Name Claim Rules

![ADFS NameID Claim Rule Screenshot](/images/nameid-rule.png)

#### Email Claim Rule

![ADFS Email Claim Rule Screenshot](/images/email.png)

#### Set Groups as Variable

![ADFS Groups Variable Rule Screenshot](/images/samlgroupsvariables.png)

This is created as a custom rule with the syntax below.

```
c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname", Issuer == "AD AUTHORITY"]
 => add(store = "Active Directory", types = ("http://temp/variable"), query = ";tokenGroups;{0}", param = c.Value);
```


#### Define Group Names to pass as Attributes

![ADFS AD Group Rule Screenshot](/images/samlgroups.png)

This is created as a custin rule with the syntax below

```
c:[Type == "http://temp/variable", Value =~ "(?i)^callrecording-"]
 => issue(Type = "groups", Value = c.Value);

This rule states that it will send ad groups starting with "callrecording-" to cognito. This rules needs to be updated with the start of the Ad groups that have been configured
```






