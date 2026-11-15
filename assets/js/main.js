(function () {
        "use strict";
        var root = document.documentElement;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* ---- Theme: follow the system until toggled ---- */
        if (window.matchMedia("(prefers-color-scheme: light)").matches) {
          root.setAttribute("data-theme", "light");
        }
        document.getElementById("themeToggle").addEventListener("click", function () {
          var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
          root.setAttribute("data-theme", next);
          if (window.__netRecolor) window.__netRecolor();
        });

        /* ---- Tab title: type-and-delete animation, as on the old site ----
           The name types out in the browser tab with a "|" cursor, pauses,
           deletes itself, and loops. Same speeds as the old site:
           250 ms per typed letter, 150 ms per deleted letter. */
        if (!reduceMotion) {
          var titleText = "Gautam Kumar";
          var titleIndex = 0;
          var titleDeleting = false;
          document.title = "|";
          var typeTitle = function () {
            if (titleDeleting) {
              titleIndex--;
              document.title = titleText.substring(0, Math.max(titleIndex, 0)) + "|";
              if (titleIndex <= 0) {
                titleDeleting = false;
                setTimeout(typeTitle, 330);
              } else {
                setTimeout(typeTitle, 150);
              }
            } else {
              titleIndex++;
              document.title = titleText.substring(0, titleIndex) + "|";
              if (titleIndex >= titleText.length) {
                titleDeleting = true;
                setTimeout(typeTitle, 330);
              } else {
                setTimeout(typeTitle, 250);
              }
            }
          };
          setTimeout(typeTitle, 250);
        }

        /* ---- Random quotes: fetched live from a quote API, typed out ---- */
        var fallbackQuotes = [
          { quote: "The best way to predict the future is to invent it.", author: "Alan Kay" },
          { quote: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
          { quote: "First, solve the problem. Then, write the code.", author: "John Johnson" },
          { quote: "Make it work, make it right, make it fast.", author: "Kent Beck" },
          { quote: "Stay hungry, stay foolish.", author: "Steve Jobs" },
          { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
          { quote: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
          { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
          { quote: "Well begun is half done.", author: "Aristotle" },
          { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
          { quote: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche" },
          { quote: "What we achieve inwardly will change outer reality.", author: "Plutarch" }
        ];
        var typer = document.getElementById("typer");
        var quoteAuthor = document.getElementById("quoteAuthor");
        var lastQuote = typer.textContent;

        function pickFallback() {
          var q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
          if (fallbackQuotes.length > 1 && q.quote === lastQuote) return pickFallback();
          return q;
        }

        function fetchQuote() {
          if (!window.fetch) return Promise.resolve(pickFallback());
          var controller = ("AbortController" in window) ? new AbortController() : null;
          var timer = controller ? setTimeout(function () { controller.abort(); }, 6000) : null;
          return fetch("https://dummyjson.com/quotes/random", controller ? { signal: controller.signal } : {})
            .then(function (r) { if (!r.ok) throw new Error("bad response"); return r.json(); })
            .then(function (d) {
              if (timer) clearTimeout(timer);
              if (!d || !d.quote) throw new Error("no quote");
              /* Keep quotes short enough to fit inside the reserved quote
                 space: at most 95 characters, so a quote never wraps past
                 the lines the quote block already reserves for it */
              if (d.quote.length > 95 || d.quote === lastQuote) return pickFallback();
              return { quote: d.quote, author: d.author || "" };
            })
            .catch(function () {
              if (timer) clearTimeout(timer);
              return pickFallback();
            });
        }

        function showAuthor(q) {
          if (!quoteAuthor) return;
          quoteAuthor.textContent = q.author ? "— " + q.author : "";
          quoteAuthor.classList.toggle("show", !!q.author);
        }

        if (reduceMotion) {
          /* No typing loop: show one random quote, still */
          fetchQuote().then(function (q) {
            lastQuote = q.quote;
            typer.textContent = q.quote;
            showAuthor(q);
          });
        } else {
          var wait = function (ms) { return new Promise(function (res) { setTimeout(res, ms); }); };
          var typeText = async function (text) {
            for (var i = 1; i <= text.length; i++) {
              typer.textContent = text.slice(0, i);
              await wait(42);
            }
          };
          var deleteText = async function () {
            var text = typer.textContent;
            for (var i = text.length - 1; i >= 0; i--) {
              typer.textContent = text.slice(0, i);
              await wait(15);
            }
          };
          var runQuotes = async function () {
            await wait(2600);
            while (true) {
              if (quoteAuthor) quoteAuthor.classList.remove("show");
              await deleteText();
              await wait(320);
              var q = await fetchQuote();
              lastQuote = q.quote;
              await typeText(q.quote);
              showAuthor(q);
              await wait(4600);
            }
          };
          runQuotes();
        }

        /* ---- Profile tag: typing animation, only the first time ---- */
        var profileTag = document.getElementById("profileTag");
        if (profileTag && !reduceMotion) {
          var profileTypedOnce = false;
          (function typeProfileTagOnce() {
            if (profileTypedOnce) return;
            profileTypedOnce = true;
            var mainSteps = [
              { t: "S", big: true }, { t: "T" }, { t: "I" }, { t: "L" }, { t: "L" },
              { t: " " },
              { t: "S", big: true }, { t: "T" }, { t: "R" }, { t: "U" }, { t: "G" },
              { t: "G" }, { t: "L" }, { t: "I" }, { t: "N" }, { t: "G", big: true }
            ];
            var supText = "a.t.m";
            var mi = 0, si = 0, supEl = null;
            /* Reserve the finished width before clearing: the pill is anchored
               to the right edge, so a growing pill would push the typed text
               leftwards (right-to-left). With the box held at its final width,
               the start stays put and the typing runs left to right. */
            profileTag.style.minWidth = profileTag.offsetWidth + "px";
            profileTag.innerHTML = "";
            var caret = document.createElement("span");
            caret.className = "tag-caret";
            caret.setAttribute("aria-hidden", "true");
            profileTag.appendChild(caret);
            function insertMain(step) {
              if (step.big) {
                var s = document.createElement("span");
                s.className = "big";
                s.textContent = step.t;
                profileTag.insertBefore(s, caret);
              } else {
                profileTag.insertBefore(document.createTextNode(step.t), caret);
              }
            }
            function typeNext() {
              if (mi < mainSteps.length) {
                insertMain(mainSteps[mi]);
                mi++;
                setTimeout(typeNext, 68);
                return;
              }
              if (!supEl) {
                supEl = document.createElement("sup");
                profileTag.insertBefore(supEl, caret);
                setTimeout(typeNext, 90);
                return;
              }
              if (si < supText.length) {
                supEl.textContent += supText.charAt(si);
                si++;
                setTimeout(typeNext, 58);
                return;
              }
              /* Done — typing happens only this once, then the tag stays static */
              setTimeout(function () {
                if (caret.parentNode) caret.parentNode.removeChild(caret);
              }, 650);
            }
            setTimeout(typeNext, 380);
          })();
        }

        /* ---- Avatar tilt (fine pointers only) ---- */
        var tilt = document.getElementById("tilt");
        if (!reduceMotion && window.matchMedia("(pointer: fine)").matches && tilt) {
          var heroVisual = tilt.parentElement;
          heroVisual.addEventListener("pointermove", function (e) {
            var r = heroVisual.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5;
            var y = (e.clientY - r.top) / r.height - 0.5;
            tilt.style.transform = "rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg)";
          });
          heroVisual.addEventListener("pointerleave", function () { tilt.style.transform = ""; });
        }

        /* ---- Profile tap: rotate randomly ----
           Every tap (or Enter / Space when it is focused) spins
           the whole profile — photo, coloured ring and orbit
           tag together — by a random amount in a random
           direction, and it stays at that new angle until the
           next tap. The spin is cumulative, so it never snaps
           back: each tap adds 90–630° (a quarter turn up to a
           full spin and three quarters) clockwise or anticlockwise
           at random, landing the profile at a fresh random
           rotation every time. The spin on the ring itself is
           separate from the pointer tilt on its parent, so the
           two never fight. A longer spin takes a little longer,
           so big whirls don't whip around faster than small ones. */
        var avatarRing = document.getElementById("avatarRing");
        /* Set by the roamer engine further down (once it has run):
           calling it swaps every animal and vehicle on the page
           for a fresh random pick. Null until then, and on pages
           where the roamers never start it simply stays null. */
        var shuffleRoamers = null;
        if (avatarRing) {
          var profileRotation = 0;
          var spinProfile = function () {
            var direction = Math.random() < 0.5 ? -1 : 1;
            var amount = 90 + Math.random() * 540;
            profileRotation += direction * amount;
            avatarRing.style.transitionDuration =
              (0.65 + (amount / 360) * 0.45).toFixed(2) + "s";
            avatarRing.style.transform = "rotate(" + profileRotation.toFixed(1) + "deg)";
            /* The same tap also changes the animals and vehicles:
               each roamer is swapped in place for a different
               random one, right where it stands */
            if (shuffleRoamers) shuffleRoamers();
          };
          avatarRing.addEventListener("click", spinProfile);
          avatarRing.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
              e.preventDefault();
              spinProfile();
            }
          });
        }

        /* ---- Roamers: animals all over the page, vehicles only
           on the footer line ----
           Two roamers wander at once, each picked at random from
           the pool: animals (cat, dog, rabbit, fox) and vehicles
           (car, truck, motorbike). Animals roam all over the page;
           vehicles drive back and forth along the footer line
           only — the footer's top border, with their wheels on
           the line and their bodies above it, never inside the
           footer strip below it (see groundY). A roamer picks a spot, runs or
           drives to it — legs galloping or wheels spinning, speed
           easing up and down at random like accelerating and
           braking — then rests or parks a while: animals turn to
           face you, blinking, breathing and wiggling their tails;
           vehicles park on the footer with their headlights
           blinking. Animals get tired the more they run, so their
           rests grow longer and sleepier. Everything is shy: bring
           the cursor close and it bolts away at full speed — a
           vehicle bolts sideways along the footer. Now and then a
           roamer leaves the page altogether and a different random
           one comes in. Purely decorative — it never takes clicks. */
        var ART = {};
        /* The cat's artwork already lives in the page (in the
           #catArt template): lift it out and rename its classes to
           the shared roamer ones */
        (function collectCatArt() {
          var tpl = document.getElementById("catArt");
          if (!tpl || !tpl.content) return;
          var side = tpl.content.querySelector(".cat-side");
          if (side) {
            side = side.cloneNode(true);
            side.classList.remove("cat-side");
            side.classList.add("view-side");
            ART.catSide = side.outerHTML;
          }
          var front = tpl.content.querySelector(".cat-front");
          if (front) {
            front = front.cloneNode(true);
            front.classList.remove("cat-front");
            front.classList.add("view-front");
            var renames = [
              ["front-tail", "f-tail"], ["front-breathe", "f-breathe"],
              ["front-head", "f-head"], ["eye", "f-eye"], ["ear-r", "f-ear-r"]
            ];
            for (var i = 0; i < renames.length; i++) {
              var els = front.querySelectorAll("." + renames[i][0]);
              for (var j = 0; j < els.length; j++) {
                els[j].classList.remove(renames[i][0]);
                els[j].classList.add(renames[i][1]);
              }
            }
            ART.catFront = front.outerHTML;
          }
        })();

        ART.dogSide = '<svg class="view-side" viewBox="0 0 120 72" fill="none" aria-hidden="true">'
          + '<path class="tail" d="M22 30 C10 27 4 17 8 9 C11 4 18 6 17 12 C16 19 19 24 26 27 Z" fill="#8a5a2e"/>'
          + '<g class="leg leg-b"><path d="M30 48 L26 66 L33 66 L36 50 Z" fill="#8a5a2e"/></g>'
          + '<g class="leg leg-a"><path d="M43 50 L41 67 L48 67 L48 51 Z" fill="#b57e46"/></g>'
          + '<path d="M22 32 C22 22 33 15 49 15 L73 15 C89 15 97 23 97 32 C97 43 88 50 73 50 L47 50 C32 50 22 43 22 32 Z" fill="#c08a4e"/>'
          + '<path d="M30 44 C42 49 68 49 82 43 C70 48 42 48 30 44 Z" fill="#e8c193"/>'
          + '<g class="leg leg-a"><path d="M79 48 L77 66 L84 66 L85 50 Z" fill="#8a5a2e"/></g>'
          + '<g class="leg leg-b"><path d="M90 46 L92 65 L99 65 L95 48 Z" fill="#b57e46"/></g>'
          + '<path d="M89 25 L100 33" stroke="#d64541" stroke-width="4" stroke-linecap="round"/>'
          + '<g class="head">'
          + '<circle cx="99" cy="24" r="14" fill="#c08a4e"/>'
          + '<path d="M104 20 L119 24 C121 25 121 31 119 32 L104 33 C101 30 101 23 104 20 Z" fill="#cfa96f"/>'
          + '<circle cx="118" cy="26" r="3" fill="#241407"/>'
          + '<circle cx="101" cy="22" r="2.1" fill="#1d130a"/>'
          + '<path d="M110 33 C111 37 115 38 117 35 L113 32 Z" fill="#e56b6f"/>'
          + '<path class="flop" d="M93 11 C86 11 83 20 85 31 C86 38 93 38 94 31 L95 15 C95 12 94 11 93 11 Z" fill="#8a5a2e"/>'
          + '</g></svg>';
        ART.dogFront = '<svg class="view-front" viewBox="0 0 120 72" fill="none" aria-hidden="true">'
          + '<path class="f-tail" d="M88 62 C102 62 108 54 104 46 C102 42 96 43 97 48 C98 54 94 58 86 58 Z" fill="#8a5a2e"/>'
          + '<g class="f-breathe">'
          + '<path d="M60 34 C76 34 86 46 86 58 C86 66 80 70 60 70 C40 70 34 66 34 58 C34 46 44 34 60 34 Z" fill="#c08a4e"/>'
          + '<path d="M60 44 C67 44 71 50 71 58 C71 64 67 68 60 68 C53 68 49 64 49 58 C49 50 53 44 60 44 Z" fill="#e8c193"/>'
          + '<path d="M46 70 L46 62 C46 59 52 59 52 62 L52 70 Z" fill="#a06a35"/>'
          + '<path d="M68 70 L68 62 C68 59 74 59 74 62 L74 70 Z" fill="#a06a35"/>'
          + '</g>'
          + '<g class="f-head">'
          + '<path d="M41 13 C33 13 29 25 32 38 C34 47 42 46 43 36 L44 17 C44 14 43 13 41 13 Z" fill="#8a5a2e"/>'
          + '<path d="M79 13 C87 13 91 25 88 38 C86 47 78 46 77 36 L76 17 C76 14 77 13 79 13 Z" fill="#8a5a2e"/>'
          + '<circle cx="60" cy="26" r="19" fill="#c08a4e"/>'
          + '<g class="f-eye"><ellipse cx="52" cy="25" rx="2.6" ry="3.4" fill="#1d130a"/><circle cx="53" cy="23.8" r="0.9" fill="#ffffff" opacity="0.85"/></g>'
          + '<g class="f-eye"><ellipse cx="68" cy="25" rx="2.6" ry="3.4" fill="#1d130a"/><circle cx="69" cy="23.8" r="0.9" fill="#ffffff" opacity="0.85"/></g>'
          + '<ellipse cx="60" cy="33" rx="9" ry="6.5" fill="#e8c193"/>'
          + '<path class="f-tongue" d="M56.5 37 L63.5 37 L62.8 45 C62.4 48 57.6 48 57.2 45 Z" fill="#e56b6f"/>'
          + '<ellipse cx="60" cy="31" rx="3.4" ry="2.6" fill="#241407"/>'
          + '</g></svg>';

        ART.rabbitSide = '<svg class="view-side" viewBox="0 0 120 72" fill="none" aria-hidden="true">'
          + '<circle class="tail" cx="27" cy="40" r="7" fill="#eef1f3"/>'
          + '<path d="M44 50 L42 62 L49 62 L50 51 Z" fill="#8f979e"/>'
          + '<path d="M31 46 C29 34 41 25 57 25 L71 25 C85 25 93 33 92 43 C91 52 83 57 69 57 L49 57 C39 57 32 53 31 46 Z" fill="#aeb6bd"/>'
          + '<path d="M40 52 C50 56 74 56 84 51 C74 55 50 55 40 52 Z" fill="#e8ecee"/>'
          + '<path d="M80 50 L81 61 L88 61 L86 50 Z" fill="#8f979e"/>'
          + '<g class="head">'
          + '<g class="flop">'
          + '<path d="M86 26 L70 5 C67 1 62 3 64 8 L76 29 Z" fill="#aeb6bd"/>'
          + '<path d="M84 24 L73 9 C72 7 69 8 70 11 L78 25 Z" fill="#f2b8c6"/>'
          + '<path d="M93 25 L85 4 C84 1 79 2 80 6 L87 26 Z" fill="#aeb6bd"/>'
          + '</g>'
          + '<circle cx="92" cy="37" r="12" fill="#aeb6bd"/>'
          + '<circle cx="97" cy="35" r="1.9" fill="#1d130a"/>'
          + '<path d="M103 40 L106 41 L103 43 Z" fill="#e56b6f"/>'
          + '<path d="M104 44 L110 42 M104 46 L110 47" stroke="#f3e9dc" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>'
          + '</g></svg>';
        ART.rabbitFront = '<svg class="view-front" viewBox="0 0 120 72" fill="none" aria-hidden="true">'
          + '<g class="f-tail"><circle cx="90" cy="60" r="7" fill="#eef1f3"/><circle cx="84" cy="64" r="5" fill="#eef1f3"/></g>'
          + '<g class="f-breathe">'
          + '<path d="M60 38 C74 38 83 48 83 59 C83 67 77 70 60 70 C43 70 37 67 37 59 C37 48 46 38 60 38 Z" fill="#aeb6bd"/>'
          + '<path d="M60 47 C66 47 69 52 69 59 C69 64 66 67 60 67 C54 67 51 64 51 59 C51 52 54 47 60 47 Z" fill="#e8ecee"/>'
          + '<path d="M47 70 L47 63 C47 60 53 60 53 63 L53 70 Z" fill="#8f979e"/>'
          + '<path d="M67 70 L67 63 C67 60 73 60 73 63 L73 70 Z" fill="#8f979e"/>'
          + '</g>'
          + '<g class="f-head">'
          + '<path d="M49 24 C46 12 46 4 50 2 C54 0 56 10 55 24 Z" fill="#aeb6bd"/>'
          + '<path d="M50.5 21 C49.5 13 49.5 7 51 5.5 C52.5 4 53.5 11 53 21 Z" fill="#f2b8c6"/>'
          + '<path class="f-ear-r" d="M71 24 C74 12 74 4 70 2 C66 0 64 10 65 24 Z" fill="#aeb6bd"/>'
          + '<circle cx="60" cy="31" r="17" fill="#aeb6bd"/>'
          + '<g class="f-eye"><ellipse cx="53" cy="30" rx="2.4" ry="3.2" fill="#1d130a"/><circle cx="54" cy="28.8" r="0.9" fill="#ffffff" opacity="0.85"/></g>'
          + '<g class="f-eye"><ellipse cx="67" cy="30" rx="2.4" ry="3.2" fill="#1d130a"/><circle cx="68" cy="28.8" r="0.9" fill="#ffffff" opacity="0.85"/></g>'
          + '<path class="f-nose" d="M57.5 37 L62.5 37 L60 40 Z" fill="#e56b6f"/>'
          + '<path d="M60 40 C60 42.5 57.5 43.5 55.5 42 M60 40 C60 42.5 62.5 43.5 64.5 42" stroke="#5d686f" stroke-width="1.6" stroke-linecap="round"/>'
          + '<path d="M45 36 L34 34 M45 40 L35 41 M75 36 L86 34 M75 40 L85 41" stroke="#f3e9dc" stroke-width="1.3" stroke-linecap="round" opacity="0.85"/>'
          + '</g></svg>';

        ART.foxSide = '<svg class="view-side" viewBox="0 0 120 72" fill="none" aria-hidden="true">'
          + '<g class="tail"><path d="M24 42 C6 40 -2 26 6 14 C12 5 26 9 26 21 C26 30 29 36 35 40 Z" fill="#e06426"/><path d="M6 14 C10 8 18 6 22 9 C16 12 10 13 6 14 Z" fill="#f6ede2"/></g>'
          + '<g class="leg leg-b"><path d="M32 48 L28 66 L35 66 L38 50 Z" fill="#7a3b16"/></g>'
          + '<g class="leg leg-a"><path d="M44 50 L42 67 L49 67 L49 51 Z" fill="#a34d1c"/></g>'
          + '<path d="M24 33 C24 23 35 16 50 16 L74 16 C89 16 97 24 97 33 C97 44 88 51 74 51 L48 51 C34 51 24 44 24 33 Z" fill="#e8762c"/>'
          + '<path d="M78 51 C88 49 94 44 96 36 C92 44 86 48 78 51 Z" fill="#f6ede2"/>'
          + '<g class="leg leg-a"><path d="M80 48 L78 66 L85 66 L86 50 Z" fill="#7a3b16"/></g>'
          + '<g class="leg leg-b"><path d="M91 46 L93 65 L100 65 L96 48 Z" fill="#a34d1c"/></g>'
          + '<g class="head">'
          + '<path d="M88 4 L96 14 L86 17 Z" fill="#e8762c"/>'
          + '<path d="M105 3 L109 14 L99 16 Z" fill="#e8762c"/>'
          + '<circle cx="98" cy="26" r="14" fill="#e8762c"/>'
          + '<path d="M103 24 L118 29 C120 30 119 34 117 34 L103 33 C101 30 101 26 103 24 Z" fill="#f6ede2"/>'
          + '<circle cx="117" cy="30" r="2.6" fill="#241407"/>'
          + '<circle cx="100" cy="24" r="2" fill="#1d130a"/>'
          + '</g></svg>';
        ART.foxFront = '<svg class="view-front" viewBox="0 0 120 72" fill="none" aria-hidden="true">'
          + '<g class="f-tail"><path d="M88 62 C102 62 108 54 104 46 C102 42 96 43 97 48 C98 54 94 58 86 58 Z" fill="#e06426"/><path d="M104 46 C102 42 96 43 97 48 C97 50 98 52 100 53 C103 51 105 49 104 46 Z" fill="#f6ede2"/></g>'
          + '<g class="f-breathe">'
          + '<path d="M60 34 C76 34 86 46 86 58 C86 66 80 70 60 70 C40 70 34 66 34 58 C34 46 44 34 60 34 Z" fill="#e8762c"/>'
          + '<path d="M60 44 C67 44 71 50 71 58 C71 64 67 68 60 68 C53 68 49 64 49 58 C49 50 53 44 60 44 Z" fill="#f6ede2"/>'
          + '<path d="M46 70 L46 62 C46 59 52 59 52 62 L52 70 Z" fill="#a34d1c"/>'
          + '<path d="M68 70 L68 62 C68 59 74 59 74 62 L74 70 Z" fill="#a34d1c"/>'
          + '</g>'
          + '<g class="f-head">'
          + '<path d="M40 18 L43 3 L57 10 Z" fill="#e8762c"/>'
          + '<path class="f-ear-r" d="M80 18 L77 3 L63 10 Z" fill="#e8762c"/>'
          + '<path d="M43 15 L44.5 7 L53 11 Z" fill="#7a3b16"/>'
          + '<path d="M77 15 L75.5 7 L67 11 Z" fill="#7a3b16"/>'
          + '<circle cx="60" cy="27" r="19" fill="#e8762c"/>'
          + '<path d="M60 30 C68 30 72 35 71 41 C70 46 65 48 60 48 C55 48 50 46 49 41 C48 35 52 30 60 30 Z" fill="#f6ede2"/>'
          + '<g class="f-eye"><ellipse cx="52" cy="25" rx="2.6" ry="3.4" fill="#1d130a"/><circle cx="53" cy="23.8" r="0.9" fill="#ffffff" opacity="0.85"/></g>'
          + '<g class="f-eye"><ellipse cx="68" cy="25" rx="2.6" ry="3.4" fill="#1d130a"/><circle cx="69" cy="23.8" r="0.9" fill="#ffffff" opacity="0.85"/></g>'
          + '<ellipse cx="60" cy="38" rx="3.2" ry="2.4" fill="#241407"/>'
          + '<path d="M60 40.5 C60 43 58 44 56 42.8 M60 40.5 C60 43 62 44 64 42.8" stroke="#8a4b12" stroke-width="1.6" stroke-linecap="round"/>'
          + '</g></svg>';

        function wheelSVG(cx) {
          return '<g class="wheel"><circle cx="' + cx + '" cy="54" r="10.5" fill="#1d1d20"/>'
            + '<circle cx="' + cx + '" cy="54" r="4.6" fill="#cfd4d6"/>'
            + '<path d="M' + cx + ' 45 L' + cx + ' 63 M' + (cx - 9) + ' 54 L' + (cx + 9) + ' 54" stroke="#8f979c" stroke-width="2.4"/></g>';
        }
        function puffsSVG(x, y) {
          return '<circle class="puff p1" cx="' + x + '" cy="' + y + '" r="3.2" fill="#c8cfd2"/>'
            + '<circle class="puff p2" cx="' + x + '" cy="' + y + '" r="4" fill="#c8cfd2"/>'
            + '<circle class="puff p3" cx="' + x + '" cy="' + y + '" r="2.6" fill="#c8cfd2"/>';
        }
        ART.carSide = '<svg class="view-side" viewBox="0 0 160 72" fill="none" aria-hidden="true">'
          + puffsSVG(7, 57)
          + '<path d="M10 47 C10 40 16 36 27 34 L40 33 C48 23 59 17 73 17 L94 17 C107 17 115 24 121 33 L136 35 C145 36 149 41 149 48 L149 52 C149 55 146 57 141 57 L18 57 C13 57 10 53 10 47 Z" fill="#ff9933"/>'
          + '<path d="M45 32 C51 25 59 21 69 20 L71 20 L71 32 Z" fill="#9fd8e8"/>'
          + '<path d="M76 20 L92 20 C100 20 107 25 112 32 L76 32 Z" fill="#9fd8e8"/>'
          + '<path d="M20 44 L139 44" stroke="#d97c1e" stroke-width="2" opacity="0.6"/>'
          + '<rect x="10" y="41" width="4" height="6" rx="2" fill="#d64541"/>'
          + '<circle cx="145" cy="43" r="3.4" fill="#8a6d1f"/>'
          + '<circle class="hl-on" cx="145" cy="43" r="3.4" fill="#ffe9a8"/>'
          + '<ellipse class="hl-glow" cx="152" cy="43" rx="8" ry="4.4" fill="#ffdf7e"/>'
          + wheelSVG(40) + wheelSVG(118)
          + '</svg>';
        ART.truckSide = '<svg class="view-side" viewBox="0 0 164 72" fill="none" aria-hidden="true">'
          + puffsSVG(6, 58)
          + '<rect x="8" y="12" width="88" height="38" rx="3" fill="#dfe3e1"/>'
          + '<rect x="8" y="12" width="88" height="10" rx="3" fill="#14b8a6"/>'
          + '<path d="M100 50 L100 25 C100 21 103 18 108 18 L120 18 C126 18 131 22 134 28 L139 38 C140 41 140 50 138 50 Z" fill="#14b8a6"/>'
          + '<path d="M105 24 L118 24 C122 24 125 27 127 31 L105 31 Z" fill="#9fd8e8"/>'
          + '<rect x="8" y="48" width="130" height="4" fill="#3c464c"/>'
          + '<circle cx="136" cy="40" r="3.2" fill="#8a6d1f"/>'
          + '<circle class="hl-on" cx="136" cy="40" r="3.2" fill="#ffe9a8"/>'
          + '<ellipse class="hl-glow" cx="146" cy="40" rx="8" ry="4.4" fill="#ffdf7e"/>'
          + wheelSVG(32) + wheelSVG(72) + wheelSVG(118)
          + '</svg>';
        ART.bikeSide = '<svg class="view-side" viewBox="0 0 150 72" fill="none" aria-hidden="true">'
          + puffsSVG(16, 60)
          + '<path d="M18 44 A13 13 0 0 1 40 42" stroke="#d64541" stroke-width="3.4" fill="none"/>'
          + '<path d="M30 53 L56 30 L84 30 L100 44 L118 53" stroke="#3c464c" stroke-width="4" fill="none" stroke-linecap="round"/>'
          + '<circle cx="72" cy="46" r="7" fill="#8f979c"/>'
          + '<path d="M62 26 C70 21 82 22 86 28 C82 32 68 32 62 26 Z" fill="#d64541"/>'
          + '<path d="M44 27 L64 27" stroke="#26221f" stroke-width="6" stroke-linecap="round"/>'
          + '<path d="M102 28 L118 53" stroke="#8f979c" stroke-width="4" stroke-linecap="round"/>'
          + '<path d="M96 24 L104 27 L100 31" stroke="#26221f" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
          + '<circle cx="106" cy="29" r="4" fill="#8a6d1f"/>'
          + '<circle class="hl-on" cx="106" cy="29" r="4" fill="#ffe9a8"/>'
          + '<ellipse class="hl-glow" cx="117" cy="29" rx="8" ry="4.2" fill="#ffdf7e"/>'
          + wheelSVG(30) + wheelSVG(118)
          + '</svg>';

        /* The pool: w = on-screen width in px, ratio = height/width
           of its artwork, speed multiplies the shared pace ranges */
        var TYPES = {
          cat:    { kind: "animal",  w: 58,  ratio: 72 / 120, speed: 1 },
          dog:    { kind: "animal",  w: 62,  ratio: 72 / 120, speed: 0.95 },
          rabbit: { kind: "animal",  w: 50,  ratio: 72 / 120, speed: 1.15 },
          fox:    { kind: "animal",  w: 60,  ratio: 72 / 120, speed: 1.05 },
          car:    { kind: "vehicle", w: 92,  ratio: 72 / 160, speed: 1.5 },
          truck:  { kind: "vehicle", w: 104, ratio: 72 / 164, speed: 1.25 },
          bike:   { kind: "vehicle", w: 80,  ratio: 72 / 150, speed: 1.7 }
        };
        var TYPE_KEYS = Object.keys(TYPES);

        var roamBox = document.getElementById("roamers");
        if (roamBox && reduceMotion) {
          /* Reduced motion: one cat sits still by the footer instead */
          var stillRoamer = document.createElement("div");
          stillRoamer.className = "roamer";
          stillRoamer.style.left = "auto";
          stillRoamer.style.right = "1.1rem";
          stillRoamer.style.top = "auto";
          stillRoamer.style.bottom = "4.4rem";
          stillRoamer.style.width = "58px";
          stillRoamer.innerHTML = '<div class="r-inner">' + (ART.catSide || "") + "</div>";
          roamBox.appendChild(stillRoamer);
          /* A profile tap still swaps it for a different random
             animal or vehicle — it just stays still */
          var stillType = "cat";
          shuffleRoamers = function () {
            var pool = TYPE_KEYS.filter(function (k) { return k !== stillType; });
            stillType = pool[Math.floor(Math.random() * pool.length)];
            stillRoamer.style.width = TYPES[stillType].w + "px";
            stillRoamer.innerHTML = '<div class="r-inner">' + (ART[stillType + "Side"] || "") + "</div>";
          };
        } else if (roamBox) {
          var roamScale = window.innerWidth <= 896 ? 0.82 : 1;
          /* The cursor everything runs away from: updated on every
             pointer move or press, parked far off-screen when the
             pointer leaves the page */
          var cursor = { x: -9999, y: -9999 };
          function trackCursor(e) { cursor.x = e.clientX; cursor.y = e.clientY; }
          window.addEventListener("pointermove", trackCursor);
          window.addEventListener("pointerdown", trackCursor);
          document.addEventListener("mouseleave", function () {
            cursor.x = -9999; cursor.y = -9999;
          });

          var roamers = [];
          var roamLast = null;

          function randTypeKey(exclude) {
            var pool = TYPE_KEYS.filter(function (k) { return exclude.indexOf(k) === -1; });
            return pool[Math.floor(Math.random() * pool.length)];
          }
          function groundY(r) {
            /* Vehicles run ON the footer line — the footer's top
               border — not inside the footer strip below it. Their
               wheels rest on that line: in the artwork the wheel
               bottoms sit at 64.5/72 of the height, so the vehicle
               is placed that far above the line, straddling it with
               its body above the line and its wheels touching it.
               The line position is taken fresh from the footer
               element every time, so it tracks the footer exactly
               on any screen size. */
            var foot = document.querySelector("footer");
            if (!foot) return Math.max(8, window.innerHeight - r.h - 10);
            var rect = foot.getBoundingClientRect();
            /* A tiny per-vehicle offset (scaled right down) so two
               vehicles don't sit pixel-identically when they cross,
               without lifting them visibly off the line */
            var y = rect.top - r.h * (64.5 / 72) + (r.laneOffset || 0) * 0.4;
            return Math.max(8, Math.min(y, window.innerHeight - r.h - 2));
          }
          function artFor(key) {
            var t = TYPES[key];
            return '<div class="r-inner">' + (ART[key + "Side"] || "")
              + (t.kind === "animal" ? (ART[key + "Front"] || "") : "") + "</div>";
          }
          function dressRoamer(r, key) {
            r.type = key;
            r.def = TYPES[key];
            r.w = Math.round(r.def.w * roamScale);
            r.h = Math.round(r.def.w * roamScale * r.def.ratio);
            r.el.className = "roamer" + (r.def.kind === "animal" ? " has-front" : "");
            r.el.setAttribute("data-type", key);
            r.el.setAttribute("data-kind", r.def.kind);
            r.el.style.width = r.w + "px";
            r.el.innerHTML = artFor(key);
            if (r.def.kind === "vehicle") r.y = groundY(r);
          }
          function makeRoamer(key, x, y) {
            var el = document.createElement("div");
            roamBox.appendChild(el);
            var r = {
              el: el, type: null, def: null, w: 0, h: 0,
              x: x, y: y, vel: 0, cruise: 90, cruiseUntil: 0,
              pauseUntil: 0, target: null, exiting: false,
              angle: 0, flip: 1, fatigue: 0, lastPace: 0,
              laneOffset: Math.random() * 8 - 4
            };
            dressRoamer(r, key);
            r.x = x; r.y = y;
            if (r.def.kind === "vehicle") r.y = groundY(r);
            roamers.push(r);
            placeRoamer(r);
            return r;
          }
          function placeRoamer(r) {
            r.el.style.transform =
              "translate(" + r.x.toFixed(1) + "px," + r.y.toFixed(1) + "px)" +
              " rotate(" + r.angle.toFixed(1) + "deg) scaleX(" + r.flip + ")";
          }
          function pickCruise(r) {
            /* Mostly a gentle amble, sometimes livelier, rarely a
               short burst — each kind at its own pace. A tired
               animal ambles slower still, up to ~30% slower when
               it is worn out */
            var p = Math.random();
            var base;
            if (p < 0.12) base = 190 + Math.random() * 50;
            else if (p < 0.45) base = 120 + Math.random() * 60;
            else base = 55 + Math.random() * 75;
            return base * r.def.speed * (1 - 0.3 * r.fatigue);
          }
          function pickTarget(r) {
            var pad = 14;
            var maxX = Math.max(pad, window.innerWidth - r.w - pad);
            /* Now and then a roamer leaves altogether: its target
               is off the edge of the page, and when it gets there a
               different random one comes in */
            if (Math.random() < 0.15) {
              r.exiting = true;
              var exitLeft = Math.random() < 0.5;
              r.target = {
                x: exitLeft ? -r.w - 60 : window.innerWidth + 60,
                y: r.def.kind === "vehicle" ? groundY(r)
                  : pad + Math.pow(Math.random(), 0.55) * Math.max(pad, window.innerHeight - r.h - pad * 2)
              };
              return;
            }
            r.exiting = false;
            if (r.def.kind === "vehicle") {
              var tx = pad + Math.random() * (maxX - pad);
              var triesV = 0;
              while (triesV < 8 && Math.abs(tx - r.x) < 260) {
                tx = pad + Math.random() * (maxX - pad);
                triesV++;
              }
              r.target = { x: tx, y: groundY(r) };
              return;
            }
            var maxY = Math.max(pad, window.innerHeight - r.h - pad);
            var x, y, tries = 0;
            do {
              x = pad + Math.random() * (maxX - pad);
              /* Favour the ground — animals mostly run along the floor */
              y = pad + Math.pow(Math.random(), 0.55) * (maxY - pad);
              tries++;
            } while (tries < 8 && Math.hypot(x - r.x, y - r.y) < 220);
            r.target = { x: x, y: y };
          }
          function respawnRoamer(r) {
            /* It left the page: a different random roamer comes in
               from an edge instead */
            var others = roamers.filter(function (o) { return o !== r; })
              .map(function (o) { return o.type; });
            dressRoamer(r, randTypeKey(others));
            r.laneOffset = Math.random() * 8 - 4;
            var fromLeft = Math.random() < 0.5;
            r.x = fromLeft ? -r.w + 6 : window.innerWidth - 6;
            r.y = r.def.kind === "vehicle" ? groundY(r)
              : Math.max(8, window.innerHeight - r.h - 20 - Math.random() * (window.innerHeight * 0.35));
            r.vel = 0;
            r.fatigue = 0;
            r.exiting = false;
            r.pauseUntil = 0;
            r.el.classList.remove("sleepy");
            pickTarget(r);
            if (r.exiting) pickTarget(r);
            placeRoamer(r);
          }
          function stepRoamer(r, ts, dt) {
            /* Shy: if the cursor gets close, it bolts. The escape
               point is recomputed every frame while the cursor stays
               near, so it keeps running until it is out of reach —
               and a rest is cut short the moment the cursor arrives */
            var fleeing = false;
            var ccx = r.x + r.w / 2, ccy = r.y + r.h / 2;
            var fdx = ccx - cursor.x, fdy = ccy - cursor.y;
            var fdist = Math.hypot(fdx, fdy);
            /* A resting roamer notices the cursor from a bit further
               off, so it is already up and running the instant the
               cursor comes near — no finishing its rest first */
            var wasResting = ts < r.pauseUntil;
            if (fdist < (wasResting ? 215 : 175)) {
              fleeing = true;
              r.pauseUntil = 0;
              if (wasResting) {
                /* Woken mid-rest: straight to full speed this very
                   frame, not the usual gentle wind-up from a stand */
                r.vel = Math.max(r.vel, 260 * r.def.speed);
                r.el.classList.remove("sleepy");
              }
              if (fdist < 1) {
                /* Cursor right on top of it: pick any way out */
                fdx = Math.random() - 0.5; fdy = 0.4;
                fdist = Math.hypot(fdx, fdy) || 1;
              }
              var ux = fdx / fdist, uy = fdy / fdist;
              var padF = 14;
              var maxFX = Math.max(padF, window.innerWidth - r.w - padF);
              var maxFY = Math.max(padF, window.innerHeight - r.h - padF);
              var tx = Math.min(maxFX, Math.max(padF, r.x + ux * 320));
              var ty = Math.min(maxFY, Math.max(padF, r.y + uy * 320));
              if (Math.hypot(tx - r.x, ty - r.y) < 80) {
                /* Pinned against an edge: dart sideways along it
                   instead — whichever side leaves the cursor
                   furthest behind */
                var lx = Math.min(maxFX, Math.max(padF, r.x - uy * 320));
                var ly = Math.min(maxFY, Math.max(padF, r.y + ux * 320));
                var rx2 = Math.min(maxFX, Math.max(padF, r.x + uy * 320));
                var ry2 = Math.min(maxFY, Math.max(padF, r.y - ux * 320));
                if (Math.hypot(lx - cursor.x, ly - cursor.y) >=
                    Math.hypot(rx2 - cursor.x, ry2 - cursor.y)) {
                  tx = lx; ty = ly;
                } else {
                  tx = rx2; ty = ry2;
                }
              }
              if (r.def.kind === "vehicle") ty = groundY(r);
              r.exiting = false;
              r.target = { x: tx, y: ty };
              /* Full burst while it flees, held by re-picking the
                 cruise deadline every frame it stays in danger */
              r.cruise = 300 * r.def.speed;
              r.cruiseUntil = ts + 500;
            }
            if (ts < r.pauseUntil) {
              r.el.classList.remove("running");
              r.el.classList.add("resting");
              /* Braking to a stop while it sits or parks */
              r.vel *= Math.exp(-6 * dt);
              if (r.vel < 1) r.vel = 0;
              /* Resting is how an animal's tiredness drains away —
                 a long nap restores it far more than a quick sit */
              if (r.def.kind === "animal") {
                r.fatigue = Math.max(0, r.fatigue - dt * 0.07);
              }
            } else {
              if (!r.target) pickTarget(r);
              var dx = r.target.x - r.x;
              var dy = r.target.y - r.y;
              var dist = Math.hypot(dx, dy);
              if (dist < 8) {
                if (r.exiting) { respawnRoamer(r); return; }
                /* Arrived: animals sit facing you — blinking,
                   breathing, wiggling their tails — and vehicles
                   park with their headlights blinking. How long is
                   random every time, and the tireder an animal is
                   the longer it needs: a fresh one sits 2.6–6 s, a
                   worn-out one adds up to ~7 s more, and now and
                   then it flops into a proper long nap on top */
                r.target = null;
                r.angle = 0;
                if (r.def.kind === "vehicle") {
                  r.pauseUntil = ts + 1800 + Math.random() * 3200;
                  r.el.classList.remove("sleepy");
                } else {
                  var restMs = 2600 + Math.random() * 3400
                    + r.fatigue * (2500 + Math.random() * 4500);
                  if (Math.random() < 0.22) restMs += 4000 + Math.random() * 5000;
                  r.pauseUntil = ts + restMs;
                  r.el.classList.toggle("sleepy", r.fatigue > 0.45 || restMs > 9000);
                }
              } else {
                r.el.classList.remove("resting");
                r.el.classList.remove("sleepy");
                r.el.classList.add("running");
                /* Running wears an animal out — the faster it goes,
                   the quicker the tiredness builds up */
                if (r.def.kind === "animal") {
                  r.fatigue = Math.min(1, r.fatigue + dt * (0.015 + r.vel * 0.00012));
                }
                /* Pick a new pace at random intervals, then ease the
                   actual speed toward it — accelerating gently,
                   braking a touch harder, like a real animal */
                if (ts >= r.cruiseUntil) {
                  r.cruise = pickCruise(r);
                  r.cruiseUntil = ts + 700 + Math.random() * 1400;
                }
                /* Ease off as it nears the spot, so it doesn't stop
                   dead. Speed approaches the goal exponentially, so
                   there are no sudden steps in velocity to judder */
                var goal = Math.min(r.cruise, Math.max(45, dist * 1.4));
                /* Bolting from the cursor: snap up to speed at once
                   instead of the usual gentle wind-up */
                var ease = fleeing ? 7 : (r.vel < goal ? 2.4 : 4.2);
                r.vel += (goal - r.vel) * (1 - Math.exp(-ease * dt));
                if (Math.abs(goal - r.vel) < 0.6) r.vel = goal;
                /* Legs, bob and wheels follow the speed: quick when
                   it bursts, lazy when it ambles. The pace is only
                   rewritten when it crosses into a new step —
                   rewriting the CSS animation duration every frame
                   restarted the cycles mid-stride, which stuttered */
                var pace = Math.round(Math.max(0.2, Math.min(0.5, 0.52 - r.vel * 0.0014)) * 25) / 25;
                if (pace !== r.lastPace) {
                  r.lastPace = pace;
                  r.el.style.setProperty("--pace", pace.toFixed(2) + "s");
                }
                var step = Math.min(dist, r.vel * dt);
                r.x += (dx / dist) * step;
                r.y += (dy / dist) * step;
                if (r.def.kind === "vehicle") r.y = r.target.y;
                /* Face the way it travels: mirror HORIZONTALLY when
                   it heads left, so the head always leads and it is
                   never upside down or running backwards. The tilt
                   is the slope of the path against the direction it
                   faces — nose dips downhill, lifts uphill */
                r.flip = dx < 0 ? -1 : 1;
                var slope = Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI;
                r.angle = r.flip === -1 ? -slope : slope;
                /* Vehicles stay level; animals tilt only gently, so
                   everything runs rather than flies sideways */
                var maxTilt = r.def.kind === "vehicle" ? 5 : 24;
                r.angle = Math.max(-maxTilt, Math.min(maxTilt, r.angle));
              }
            }
            placeRoamer(r);
          }
          function roamLoop(ts) {
            if (!roamLast) roamLast = ts;
            var dt = Math.min((ts - roamLast) / 1000, 0.05);
            roamLast = ts;
            if (!document.hidden) {
              for (var i = 0; i < roamers.length; i++) stepRoamer(roamers[i], ts, dt);
            }
            requestAnimationFrame(roamLoop);
          }
          /* Profile tap: swap every roamer in place for a
             different random animal or vehicle. Each pick
             excludes its own current type and the types already
             handed out in this swap, so a tap always visibly
             changes both roamers and never leaves two the same.
             The new roamer keeps the old one's spot on the page
             (vehicles snap back onto the footer line), shakes
             off any rest, tiredness or exit in progress, and
             heads off toward a fresh random target */
          shuffleRoamers = function () {
            var used = [];
            for (var i = 0; i < roamers.length; i++) {
              var r = roamers[i];
              var key = randTypeKey(used.concat([r.type]));
              used.push(key);
              r.laneOffset = Math.random() * 8 - 4;
              dressRoamer(r, key);
              r.x = Math.min(Math.max(r.x, 0), Math.max(0, window.innerWidth - r.w));
              r.y = r.def.kind === "vehicle" ? groundY(r)
                : Math.min(Math.max(r.y, 0), Math.max(0, window.innerHeight - r.h));
              r.vel = 0;
              r.fatigue = 0;
              r.exiting = false;
              r.pauseUntil = 0;
              r.target = null;
              r.el.classList.remove("sleepy");
              pickTarget(r);
              if (r.exiting) pickTarget(r);
              placeRoamer(r);
            }
          };
          /* Two roamers at a time, each a random pick from the pool */
          var firstKey = randTypeKey([]);
          makeRoamer(firstKey,
            24 + Math.random() * Math.max(40, window.innerWidth * 0.3),
            window.innerHeight - 130);
          makeRoamer(randTypeKey([firstKey]),
            Math.max(24, window.innerWidth * 0.55 + Math.random() * Math.max(40, window.innerWidth * 0.25)),
            window.innerHeight - 110);
          requestAnimationFrame(roamLoop);
          window.addEventListener("resize", function () {
            roamScale = window.innerWidth <= 896 ? 0.82 : 1;
            for (var i = 0; i < roamers.length; i++) {
              var r = roamers[i];
              dressRoamer(r, r.type);
              r.x = Math.min(r.x, Math.max(0, window.innerWidth - r.w));
              r.y = Math.min(r.y, Math.max(0, window.innerHeight - r.h));
              r.target = null;
              placeRoamer(r);
            }
          });
        }

        /* ---- Particle constellation (a nod to the old site) ---- */
        var canvas = document.getElementById("net");
        var ctx = canvas.getContext("2d");
        var W = 0, H = 0, nodes = [], raf = null;
        var mouse = { x: -9999, y: -9999 };
        var LINK = 128, MOUSE_LINK = 190;
        var rgb = "47, 230, 200";

        function palette() {
          var cs = getComputedStyle(root).getPropertyValue("--net-line").trim();
          if (cs) rgb = cs;
        }
        window.__netRecolor = palette;

        function resize() {
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          W = window.innerWidth; H = window.innerHeight;
          canvas.width = W * dpr; canvas.height = H * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          var target = Math.min(110, Math.floor((W * H) / 16000));
          nodes = [];
          for (var i = 0; i < target; i++) {
            nodes.push({
              x: Math.random() * W,
              y: Math.random() * H,
              vx: (Math.random() - 0.5) * 0.35,
              vy: (Math.random() - 0.5) * 0.35,
              r: Math.random() * 1.6 + 0.7
            });
          }
          if (reduceMotion) drawFrame();
        }

        function drawFrame() {
          ctx.clearRect(0, 0, W, H);
          var i, j, a, b, dx, dy, d;
          for (i = 0; i < nodes.length; i++) {
            a = nodes[i];
            for (j = i + 1; j < nodes.length; j++) {
              b = nodes[j];
              dx = a.x - b.x; dy = a.y - b.y;
              d = Math.sqrt(dx * dx + dy * dy);
              if (d < LINK) {
                ctx.strokeStyle = "rgba(" + rgb + "," + (0.14 * (1 - d / LINK)).toFixed(3) + ")";
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
              }
            }
            dx = a.x - mouse.x; dy = a.y - mouse.y;
            d = Math.sqrt(dx * dx + dy * dy);
            if (d < MOUSE_LINK) {
              ctx.strokeStyle = "rgba(" + rgb + "," + (0.4 * (1 - d / MOUSE_LINK)).toFixed(3) + ")";
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
            }
            ctx.fillStyle = "rgba(" + rgb + ",0.75)";
            ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
          }
        }

        function loop() {
          for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            n.x += n.vx; n.y += n.vy;
            if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
            if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
          }
          drawFrame();
          raf = requestAnimationFrame(loop);
        }

        palette();
        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
        document.addEventListener("visibilitychange", function () {
          if (reduceMotion) return;
          if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
          else if (!raf) raf = requestAnimationFrame(loop);
        });
        if (!reduceMotion) raf = requestAnimationFrame(loop);
      })();
