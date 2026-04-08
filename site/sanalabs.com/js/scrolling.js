function parents(element, className) {
  let parent = element.parentElement;
  while (parent && !parent.classList.contains(className)) {
    parent = parent.parentElement;
  }
  return parent;
}
document.addEventListener("DOMContentLoaded", () => {
  Splitting();

  const scrollAnimations = document.querySelectorAll(".scroll-animations");
  scrollAnimations.forEach((scrollAnimation) => {
    let numFrames = scrollAnimation.querySelectorAll(".animation-frame").length;
    let frameLength = 1 / numFrames;
    let snaps = [];
    for (let i = 0; i < numFrames + 1; i++) {
      snaps.push(frameLength * i);
    }
    let mainTL;
    let animationLength = numFrames * 100;
    let transitionDuration = parseFloat(scrollAnimation.dataset.transition ?? "0.25");
    if (scrollAnimation.classList.contains("snap")) {
      mainTL = gsap.timeline({
        scrollTrigger: {
          trigger: scrollAnimation,
          start: "top top",
          end: "+=" + animationLength + "%",
          scrub: true,
          pin: scrollAnimation,
          snap: {
            snapTo: "labels",
            directional: true,
            duration: { min: 0.4, max: 1 },
            delay: 0.2,
            ease: "power2.inOut",
          },
        },
      });
    } else {
      mainTL = gsap.timeline({
        scrollTrigger: {
          trigger: scrollAnimation,
          start: "top top",
          end: "+=" + animationLength + "%",
          scrub: true,
          pin: scrollAnimation,
        },
      });
    }

    mainTL.addLabel("frame-0-transition", 0);
    let prevFrameTime = 0;

    const frames = scrollAnimation.querySelectorAll(".animation-frame");
    frames.forEach((frame, i) => {
      const frameNum = frame.getAttribute("data-frame");
      const correctedIndex = i + 1;
      frame.style.zIndex = correctedIndex;
      const previousFrame = frameNum - 1;

      const length = frame.getAttribute("data-length");
      let lengthTime = 1;
      if (length) {
        lengthTime = parseFloat(length);
      }

      const startTime = prevFrameTime + lengthTime * transitionDuration;
      const frameTime = prevFrameTime + lengthTime;
      prevFrameTime += lengthTime;

      mainTL.addLabel("frame-" + frameNum, startTime);
      mainTL.addLabel("frame-" + frameNum + "-transition", frameTime);

      if (correctedIndex < frames.length) {
        mainTL.to(frame, { duration: transitionDuration, autoAlpha: 0 }, "frame-" + frameNum + "-transition+=" + transitionDuration);
      }
      if (i > 0) {
        mainTL.to(
          frame,
          {
            duration: transitionDuration,
            autoAlpha: 1,
            onStart: () => {
              const navColor = frame.getAttribute("data-nav");
              if (navColor == "white") {
                mainTL.to(".progress-bar", { duration: transitionDuration, color: "#fff", background: "rgba(255,255,255,.2)" }, "frame-" + previousFrame + "-transition");
                mainTL.to(".progress-bar .fill", { duration: transitionDuration, background: "#fff" }, "frame-" + previousFrame + "-transition");
              } else {
                mainTL.to(".progress-bar", { duration: transitionDuration, color: "#000", background: "rgba(0,0,0,.1)" }, "frame-" + previousFrame + "-transition");
                mainTL.to(".progress-bar .fill", { duration: transitionDuration, background: "#000" }, "frame-" + previousFrame + "-transition");
              }
            },
          },
          "frame-" + previousFrame + "-transition"
        );
      }
    });

    const scrollAnnotations = document.querySelectorAll(".scroll-annotate");
    scrollAnnotations.forEach((scrollAnnotation) => {});

    scrollAnimation.querySelectorAll(".scroll-to-reveal-text").forEach((textBlock) => {
      const frame = parents(textBlock, "animation-frame");
      const frameNum = frame.getAttribute("data-frame");
      const numWords = textBlock.querySelectorAll(".word").length;
      textBlock.querySelectorAll(".word").forEach((word, wordIndex) => {
        const subIndex = wordIndex * 0.03;
        const scrollAnnotateEl = word.parentElement;
        let annotation;
        if (scrollAnnotateEl.classList.contains("scroll-annotate")) {
          let type = scrollAnnotateEl.getAttribute("data-type") ?? "underline";
          annotation = RoughNotation.annotate(scrollAnnotateEl, { type: type, animationDuration: 400, padding: [0, 5] });
        }
        mainTL.to(
          word,
          {
            duration: 0.1,
            autoAlpha: 1,
            onStart: () => {
              if (annotation) {
                annotation.hide();
                annotation.show();
              }
            },
            onReverseComplete: () => {
              if (annotation) {
                annotation.hide();
              }
            },
          },
          "frame-" + frameNum + "+=" + subIndex
        );
        if (wordIndex + 1 == numWords) {
          mainTL.addLabel("frame-" + frameNum + "-text", ">");
        }
      });
    });

    scrollAnimation.querySelectorAll(".scroll-to-reveal-children").forEach((parent) => {
      const frame = parents(parent, "animation-frame");
      const frameNum = frame.getAttribute("data-frame");
      const numChildren = parent.querySelectorAll(".scroll-to-reveal-child").length;
      parent.querySelectorAll(".scroll-to-reveal-child").forEach((child, childIndex) => {
        const subIndex = childIndex * 0.1;
        mainTL.to(
          child,
          {
            duration: 0.25,
            autoAlpha: 1,
          },
          "frame-" + frameNum + "+=" + subIndex
        );
        if (childIndex + 1 == numChildren) {
          mainTL.addLabel("frame-" + frameNum + "-children", ">");
        }
      });
    });

    scrollAnimation.querySelectorAll(".reveal-text").forEach((textBlock) => {
      const frame = parents(textBlock, "animation-frame");
      const frameNum = frame.getAttribute("data-frame");
      const numWords = textBlock.querySelectorAll(".word").length;
      textBlock.querySelectorAll(".word").forEach((word, wordIndex) => {
        const subIndex = wordIndex * 0.1;
        gsap.to(word, { duration: 0.7, autoAlpha: 1 }, "frame-" + frameNum + "+=" + subIndex);
        if (wordIndex + 1 == numWords) {
          mainTL.addLabel("frame-" + frameNum + "-text", ">");
        }
      });
    });

    scrollAnimation.querySelectorAll(".triggerClass").forEach((classTrigger) => {
      const frame = parents(classTrigger, "animation-frame");
      const frameNum = frame.getAttribute("data-frame");
      const triggerTime = classTrigger.getAttribute("data-time");
      let bothDirections = false;
      if (classTrigger.classList.contains("both-directions")) {
        bothDirections = true;
      }
      if (triggerTime) {
        if (bothDirections) {
          mainTL.to(
            classTrigger,
            {
              duration: 0.1,
              autoAlpha: 1,
              onStart: () => {
                classTrigger.classList.add("animate");
              },
              onReverseComplete: () => {
                classTrigger.classList.remove("animate");
              },
            },
            "frame-" + frameNum + "+=" + parseFloat(triggerTime)
          );
        } else {
          mainTL.to(
            classTrigger,
            {
              duration: 0.1,
              autoAlpha: 1,
              onStart: () => {
                classTrigger.classList.add("animate");
              },
            },
            "frame-" + frameNum + "+=" + parseFloat(triggerTime)
          );
        }
      } else {
        if (bothDirections) {
          mainTL.to(
            classTrigger,
            {
              duration: 0.1,
              autoAlpha: 1,
              onStart: () => {
                classTrigger.classList.add("animate");
              },
              onReverseComplete: () => {
                classTrigger.classList.remove("animate");
              },
            },
            "frame-" + frameNum + "-=" + transitionDuration
          );
        } else {
          mainTL.to(
            classTrigger,
            {
              duration: 0.1,
              autoAlpha: 1,
              onStart: () => {
                classTrigger.classList.add("animate");
              },
            },
            "frame-" + frameNum + "-=" + transitionDuration
          );
        }
      }
    });

    scrollAnimation.querySelectorAll(".scroll-confetti").forEach((confetti) => {
      const frame = parents(confetti, "animation-frame");
      const frameNum = frame.getAttribute("data-frame");
      mainTL.to(
        confetti,
        {
          duration: 0.01,
          onStart: () => {
            var duration = 1.5 * 1000;
            var animationEnd = Date.now() + duration;
            var tree = window.confetti.shapeFromPath({
              path: "M17.517 11.4774C20.4513 11.2169 22.7519 8.75215 22.7519 5.75009C22.7519 2.5744 20.1775 0 17.0019 0C13.8262 0 11.2518 2.5744 11.2518 5.75009C11.2518 8.73544 13.5268 11.1894 16.4378 11.4729V5.77857H17.517V11.4774ZM22.5267 17.5542H28.2141V16.4749H22.5243C22.7904 13.5462 25.2525 11.2517 28.2506 11.2517C31.4263 11.2517 34.0007 13.8261 34.0007 17.0018C34.0007 20.1775 31.4263 22.7519 28.2506 22.7519C25.2612 22.7519 22.8046 20.4707 22.5267 17.5542ZM16.4378 22.5271V28.2508H17.517V22.5226C20.4513 22.7831 22.7519 25.2479 22.7519 28.2499C22.7519 31.4256 20.1775 34 17.0019 34C13.8262 34 11.2518 31.4256 11.2518 28.2499C11.2518 25.2646 13.5268 22.8106 16.4378 22.5271ZM11.4764 16.4749H5.74187V17.5542H11.474C11.196 20.4707 8.73946 22.7519 5.75009 22.7519C2.5744 22.7519 0 20.1775 0 17.0018C0 13.8261 2.5744 11.2517 5.75009 11.2517C8.74815 11.2517 11.2103 13.5462 11.4764 16.4749Z",
            });
            var defaults = { scalar: 1.8, startVelocity: 25, spread: 280, ticks: 150, zIndex: 0, gravity: 0.7 };
            var colors = ["#e4eff7", "#0057f3", "#6acde3", "#cdfe00", "#00dd00", "#ff8cfd", "#fa0019", "#ef029f", "#ff8cfd", "#ff5102"];

            function randomInRange(min, max) {
              return Math.random() * (max - min) + min;
            }

            var interval = setInterval(function () {
              var timeLeft = animationEnd - Date.now();

              if (timeLeft <= 0) {
                return clearInterval(interval);
              }

              var particleCount = 50 * (timeLeft / duration);
              // since particles fall down, start a bit higher than random
              window.confetti({ ...defaults, shapes: [tree], colors: colors, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
              window.confetti({ ...defaults, shapes: [tree], colors: colors, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
          },
        },
        "frame-" + frameNum + "-=" + transitionDuration
      );
    });

    scrollAnimation.querySelectorAll("video.play-on-reveal").forEach((video) => {
      const frame = parents(video, "animation-frame");
      const frameNum = frame.getAttribute("data-frame");
      const prevFrame = frameNum - 1;
      mainTL.to(
        video,
        {
          duration: 0.001,
          onStart: () => {
            if (video.paused) {
              video.currentTime = 0;
              video.play();
            }
          },
        },
        "frame-" + prevFrame + "-transition-=.001"
      );
    });

    const progressBarFills = scrollAnimation.querySelectorAll(".progress-bar");
    progressBarFills.forEach((progressBarFill, index) => {
      const fill = progressBarFill.querySelector(".fill");
      const frameNum = progressBarFill.getAttribute("data-frame");
      const length = document.querySelector('.animation-frame[data-frame="' + frameNum + '"]').getAttribute("data-length");
      let lengthTime = 1;
      if (length) {
        lengthTime = parseFloat(length);
      }
      mainTL.fromTo(fill, { height: "0%" }, { duration: lengthTime * 0.75, height: "100%" }, "frame-" + frameNum);
      progressBarFill.addEventListener("click", (e) => {
        gsap.to(window, { scrollTo: mainTL.scrollTrigger.labelToScroll("frame-" + frameNum + "-transition") });
        e.preventDefault();
      });
    });
  });
});

document.querySelectorAll(".annotate-on-view").forEach((annotateOnView) => {
  let type = annotateOnView.getAttribute("data-type") ?? "underline";
  const annotation = RoughNotation.annotate(annotateOnView, { type: type, animationDuration: 800, padding: [0, 5] });

  let observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          annotation.show();
        } else {
          annotation.hide();
        }
      });
    },
    { rootMargin: "0px 0px -25% 0px" }
  );
  observer.observe(annotateOnView);
});

const onPageLinks = document.querySelectorAll('a[href*="#"]');
for (let i = 0; i < onPageLinks.length; i++) {
  onPageLinks[i].addEventListener("click", function (e) {
    e.preventDefault();
    const link = this;
    const name = link.getAttribute("href").substring(1);
    const el = document.querySelector("#" + name);
    let offset = 56;
    window.scrollTo({
      top: el.offsetTop - offset,
      behavior: "smooth",
    });
  });
}
