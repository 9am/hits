<div align="center">
    <img src="https://hits.deno.dev/api?referer=https://github.com/9am/hits" alt="hits" width="400" />
    <p>Get dynamically generated bitmap hit counter on your READMEs!</p>
</div>

## Features

- Show a **dynamic hits counter** by inserting a \<img\>.
- Resolve **referer** automatically.
- Show last n days **trends** with `charts=date&last_n_days={n}`.
- Customise **prefix text** with `prefix={text}`.
- Align with system **dark mode** with 0 config.
- 2 color **themes** out of the box. (more are comming...)
- Secure your hits with **`ALLOW_REFERER`** env.
- Deploy your own version with **Deno deploy** and **Deno KV**.

## Embed

After deployment, copy-paste this into you Github markdown, and replace the `{referer}`.

```md
![hits](https://{your-domain}.deno.dev/api?referer={referer})
```

You don't need to pass the `{referer}` when embeding into web pages. 

```html
<img src="https://{your-domain}.deno.dev/api" referrerpolicy="no-referrer-when-downgrade" />
```

## Demo

<details>
    <summary>Embed in Github markdown.</summary>
    <img src="https://hits.deno.dev/api?referer=https://github.com/9am/hits" />
</details>
<details>
    <summary>Themes grayscale</summary>
    <img src="https://hits.deno.dev/api?referer=https://github.com/9am/hits&theme=grayscale" />
</details>
<details>
    <summary>Customise prefix</summary>
    <img src="https://hits.deno.dev/api?referer=https://github.com/9am/hits&prefix=prefix:%20" />
</details>
<details>
    <summary>14 days trends</summary>
    <img src="https://hits.deno.dev/api?referer=https://github.com/9am/hits&charts=date&last_n_days=14" />
</details>

## Support the project

If you like this project, consider    
<a href="https://www.buymeacoffee.com/at9am" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## License
[MIT](LICENSE)

