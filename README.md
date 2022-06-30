<h1>Kronos</h1>
<br />
<p>Kronos allows you to create server-wide events and personalized reminders with ease. Engage your server with events, stay on track with reminders, and more! <a href="https://discord.com/api/oauth2/authorize?client_id=972953087306240041&permissions=2147683456&scope=bot%20applications.commands">Invite Kronos here.</a></p>
<br />
<br />
<h1>Using the code</h1>
<p>Requirements: node.js version 16.9 or later, yarn, typescript</p>
<br />
<p>In order to use Kronos, create a folder named <code>dist</code> in the root of the project. You'll see why later. You must also create a .env file in the root of the project with the following variables:</p>
<ul>
<li><code>TOKEN</code> (your bot token)</li>
<li><code>GUILD_ID</code> (your test guild id. slash commands will be instantly registered in this guild)</li>
<li><code>SUCCESS_COLOR</code> (the success color of embeds -- don't include the hashtag)</li>
<li><code>ERROR_COLOR</code> (pretty self explanatory)</li>
<li><code>MONGO_URI</code> (the <a href="https://mongodb.com">MongoDB</a> connection string</li>
<li><code>DEPLOYMENT</code> (this should be false -- I'll explain this later)</li>
</ul>
<h1>What's up with the deployment environment variable?</h1>
<p>Given that I'm using TypeScript for this discord bot, you will need to compile it into JavaScript using the tsc command (installing the typescript npm package globally gives you this command). I prefer to compile the code into a folder named dist and run dist/index.js as the main file. This means that we must delete the dist folder and recompile everytime we run the bot. The command to do this will vary per operating system. If you're using windows, you can keep the package.json file as is. If not, you will have to replace dev with the <code>(command to delete dist) && yarn start</code>.</p>
<br />
<p>So why do I have the deployment environment variable? Simple, I'm hosting the bot on a linux environment and therefore, the command to delete the dist folder will be different. You'll notice I have the heroku script which runs build with the linux command to delete dist.</p>
