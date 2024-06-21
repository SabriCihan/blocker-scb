# Pure Javascript page blocker or spinner
<p>Page blocker and spinner is created whenever you want, if you are making an ajax call or reading data from file, you can use blocker to block page or element to prevent unwanted interaction</p>

<p><b>To install:</b></p>
1. Import bootstrap.min.css <br>
2. Import bootstrap.bundle.min.js<br>
3. Import blockerscb.js<br>
<br>
<p><b>a. To block and unblock  a div of form by id (javascript code) : </b></p>
<pre><code>blockerscb.block("#FormLoginTest");
blockerscb.unblock("#FormLoginTest");
</code></pre>
<p><b>b. To block and unblock by class (javascript code) : </b></p>
<pre><code>
blockerscb.block(".text-danger");
blockerscb.unblock(".text-danger");
</code></pre>
<p><b>c. To block whole page (javascript code) : </b></p>
<pre><code>
blockerscb.block();
blockerscb.unblock();
</code></pre>
