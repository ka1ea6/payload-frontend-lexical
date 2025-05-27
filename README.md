# Payload Richtext Demo

This is a demo for showcasing setup and usage of a richtext utilizing the lexical package used by the PayloadCMS backend and not adding any additional packages to prevent dependency management issues.

## Implementation information

For implementing the rich text the exports of the `@payloadcms/richtext-lexical` package have been used.

## Usage

To use the RichText component follow the following steps.

1. import the RichText component -

   ```typescript
   import RichText from '@/components/RichText'
   ```

2. Use the component in the desired place

   ```html
   <RichText name={"something"} value={value} setValue={setValue} />
   ```

Note: The value referred is the value to hold the object form (non-stringified value) of the rich text.

## Extending with plugins

Due to the setup constraints of not adding additional packages to add additional plugins/features the user is required to implement the Nodes as well as the plugins.

- Add nodes to `src/components/RichText/nodes`
- Add plugins to `src/components/RichText/plugins`

Check out the image plugin added for more information.
