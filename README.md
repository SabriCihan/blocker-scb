# blocker-scb
<p>Page blocker and spinner is created whenever you want, if you are making an ajax call or reading data from file, you can use blocker to block page or element to prevent unwanted interaction</p>

<p>To install:(Html Code)</p>
<pre><code>
<link href="plugin/bootstrap/css/bootstrap.min.css" rel="stylesheet">
<link href="plugin/blocker-scb/blocker-scb.css" rel="stylesheet">
<script src="plugin/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="plugin/blocker-scb/blocker-scb.js"></script>
</code></pre>
<p>To block and unblock  a div of form by id (javascript code) : </p>
<pre><code>blockerscb.block("#FormLoginTest");
blockerscb.unblock("#FormLoginTest");
</code></pre>
<p>To block by class (javascript code) : </p>
<pre><code>
blockerscb.block(".text-danger");
blockerscb.unblock(".text-danger");
</code></pre>
<p>To block whole page (javascript code) : </p>
<pre><code>
blockerscb.block();
blockerscb.unblock();
</code></pre>