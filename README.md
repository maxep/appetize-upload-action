# Appetize Upload Action

## Inputs

|key|description|required|defaul|
|---|---|---|---|
|api-host|Appetize API host||api.appetize.io|
|api-token|Appetize.io API Token|**x**||
|file-url|URL from which the app file can be fetched Alternative to `file-path`|||
|platform|Either `ios` or `android`|**x**||
|file-path|Path to app build on the local filesystem. Either this or `file-url` must be specified|||
|public-key|If not provided, a new app will be created. If provided, the existing build will be overwritten|||
|note|Notes you wish to add to the uploaded app|||
|timeout|The number of seconds to wait until automatically ending the session due to user inactivity. Must be 30, 60, 90, 120, 180, 300, 600, 1800, 3600 or 7200. Default is 120||120|

## Example usage

```yml
- uses: actions/checkout@v2

- name: Build App
  run: |
    xcodebuild -project App.xcodeproj -scheme App -sdk iphonesimulator -derivedDataPath output
    find output -name '*.app' -print | zip -r output/app.zip -@

- name: Upload to Appetize.io
  uses: maxep/github-action-appetize@0.1.0
  with:
      api-token: ${{ secrets.APPETIZE_TOKEN }} 
      file-path: output/app.zip
      platform: 'ios'
```