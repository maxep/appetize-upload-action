const core = require('@actions/core')
const fs = require('fs')
const axios = require("axios")
const FormData = require("form-data")

const main = async () => {

  const args = {
    host: core.getInput('api-host'),
    token: core.getInput('api-token', { required: true }),
    url: core.getInput('file-url'),
    platform: core.getInput('platform', { required: true }),
    file: core.getInput('file-path'),
    publicKey: core.getInput('public-key'),
    note: core.getInput('note'),
    timeout: core.getInput('timeout'),
  }

  if (args.platform !== 'ios' && args.platform !== 'android') 
    throw '`platform` is either `ios` or `android`'

  /**
   * Build the The Appetize API URL.
   * @returns The URL.
   */
  const appetize = () => {
    const url = `https://${args.host}/v1/apps/`
    if (args.publicKey) return url + args.publicKey
    return url
  }

  /**
   * Create or Update using a publicly accessible link.
   * @returns The Appetize API response.
   */
  const post = async () => {
    const params = {
      url: args.url,
      platform: args.platform,
      note: args.note,
      timeout: args.timeout
    }
  
    return await axios.post(appetize(), params, {
        auth: { username: args.token, password: '' }
      }
    )
  }

  /**
   * Direct file uploads
   * @returns The Appetize API response.
   */
  const upload = async () => {
    const form = new FormData()
    form.append('file', fs.createReadStream(args.file))

    if (args.platform)  form.append('platform', args.platform)
    if (args.note)      form.append('note', args.note)
    if (args.timeout)   form.append('timeout', args.timeout)
  
    const result = await axios.post(appetize(), form, {
        auth: { username: args.token, password: '' },
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    )

    fs.unlinkSync(args.file)
    return result
  }

  /**
   * Upload app to Appetize.
   * @returns The upload result.
   */
  const run = async () => {
    if (args.url) return await post()
    if (args.file) return await upload()
    throw 'Either `file-path` or `file-url` must be specified'
  }

  const { data } = await run()

  core.setOutput('APPETIZE_APP_URL', data.appURL)
  core.setOutput('APPETIZE_MANAGE_URL', data.manageURL)
  core.setOutput('APPETIZE_PUBLIC_KEY', data.publicKey)
}

main().catch(err => core.setFailed(err.message))