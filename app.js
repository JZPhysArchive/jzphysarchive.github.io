/* ==========================================================================
   JZPhysArchive — Application Logic
   ========================================================================== */

(function () {
    'use strict';

    // --- DOM References ---
    var app = document.getElementById('app');
    var sidebar = document.querySelector('.sidebar');
    var sidebarCourses = document.getElementById('sidebar-courses');
    var sidebarEmpty = document.getElementById('sidebar-empty');
    var detail = document.getElementById('detail');
    var detailContent = document.getElementById('detail-content');
    var searchInput = document.getElementById('search-input');
    var themeToggle = document.getElementById('theme-toggle');
    var backButton = document.getElementById('back-button');
    var headerBrand = document.getElementById('header-brand');
    var mobileMenuBtn = document.getElementById('mobile-menu-btn');
    var sidebarOverlay = document.getElementById('sidebar-overlay');

    var courseMap = {};

    if (typeof COURSES !== 'undefined') {
        ['szz', 'bc', 'mgr'].forEach(function (key) {
            (COURSES[key] || []).forEach(function (course) {
                courseMap[course.code] = course;
                course._category = key;
            });
        });
    }

    var ICON_EXTERNAL = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function renderHomepage() {
        var html = '<div class="homepage">';
        html += '<div class="homepage-header">';
        html += '<img src="JZ.png" alt="JZ" class="homepage-logo">';
        html += '<h1 class="homepage-title">JZPhysArchive</h1>';
        html += '</div>';
                html += `<div class="homepage-desc">
<p>Osobní archiv poznámek, úkolů a materiálů z bakalářského a magisterského studia fyziky na MFF UK.</p>
<h3 style="color: var(--text-primary); margin-top: 24px; margin-bottom: 12px; font-weight: 600;">⚠️ Disclaimer</h3>
<p>Poskytnuté materiály slouží čistě jako osobní studijní pomůcka. Mohou obsahovat, a pravděpodobně obsahují, chyby a nepřesnosti. Valná většina poznámek a úkolů byla hodnocena plnými počty bodů, stačily na zisk zápočtů, a pokud to kurz nabízel, i na složení zkoušky bez písemky či bonbónu. I přesto je potřeba je brát se špetkou soli a ověřovat si fakta z primárních zdrojů.</p>
<p>Materiály by měly být využity výhradně jako inspirace a studijní opora, <strong>nikoliv k plagiátorství</strong>, od kterého se plně distancuji.</p>
<p style="margin-top: 16px; font-size: 0.85em; color: var(--text-muted);">Pokud naleznete významnou chybu stojící za opravu, kontaktujte <a href="mailto:jzphysarchive@gmail.com" style="color: var(--primary);">jzphysarchive@gmail.com</a>.</p>
</div>`;;

        var sections = [
            { key: 'szz', label: 'St\u00E1tn\u00ED z\u00E1v\u011Bre\u010Dn\u00E9 zkou\u0161ky' },
            { key: 'bc', label: 'Bc. fyzika' },
            { key: 'mgr', label: 'Mgr. teoretick\u00E1 fyzika' }
        ];

        sections.forEach(function (sec) {
            var courses = COURSES[sec.key] || [];
            if (courses.length === 0) return;

            html += '<div class="course-map-section">';
            html += '<h2 class="course-map-title">' + sec.label + ' (' + courses.length + ')</h2>';
            html += '<ul class="course-map-list">';
            courses.forEach(function (c) {
                html += '<li class="course-map-item">';
                html += '<a href="#' + c.code + '" class="course-link" data-code="' + escapeHtml(c.code) + '">';
                html += '<span class="course-map-code">' + escapeHtml(c.code) + '</span>';
                html += '<span class="course-map-name">' + escapeHtml(c.name) + '</span>';
                html += '</a>';
                html += '</li>';
            });
            html += '</ul>';
            html += '</div>';
        });

        html += '</div>';
        detailContent.innerHTML = html;
        bindCourseLinks();
    }

    function renderItem(item, courseCode) {
        var url = item.is_md ? '#' + courseCode : 'viewer.html?file=' + encodeURIComponent(GITHUB_JSDELIVR_BASE + '/' + item.url);
        var target = item.is_md ? '_self' : '_blank';
        var onclick = item.is_md ? ' onclick="renderMarkdown(\'' + courseCode + '\', \'' + escapeHtml(item.url) + '\'); return false;"' : '';
        var html = '<li class="file-item">';
        html += '<a href="' + url + '" class="file-link" target="' + target + '" rel="noopener"' + onclick + '>';
        html += '<span class="file-name">' + escapeHtml(item.text);
        if (item.desc) {
            html += '<span class="file-desc"> - ' + escapeHtml(item.desc) + '</span>';
        }
        html += '</span>';
        if (!item.is_md) {
            html += '<span class="file-icon">' + ICON_EXTERNAL + '</span>';
        }
        html += '</a>';
        html += '</li>';
        return html;
    }

    function renderCourse(code) {
        var course = courseMap[code];
        if (!course) {
            detailContent.innerHTML = '<div class="homepage"><p>Kurz <strong>' + escapeHtml(code) + '</strong> nebyl nalezen.</p></div>';
            return;
        }

        var html = '<div class="course-detail">';

        html += '<div class="course-header" style="margin-bottom: 24px;">';
        html += '<h2 class="course-title">' + escapeHtml(course.name) + '</h2>';
        html += '<div class="course-code-header">' + escapeHtml(course.code) + '</div>';
        html += '</div>';

        html += '<div class="course-header-actions">';
        html += '<div class="course-metadata" style="margin-bottom:0; flex:1;">';
        if (course.metadata && course.metadata.length > 0) {
            course.metadata.forEach(function (meta) {
                if (meta.value) {
                    html += '<div class="meta-item"><strong>' + escapeHtml(meta.key) + ':</strong> ' + escapeHtml(meta.value) + '</div>';
                } else {
                    html += '<div class="meta-item"><strong>' + escapeHtml(meta.key) + '</strong></div>';
                }
            });
        }
        html += '</div>';

        if (course.dir_path) {
            html += '<a href=\"javascript:void(0)\" onclick=\"window.downloadCourseAsZip(this, \'' + course.code + '\')\" class=\"download-btn\" title=\"Stáhnout kurz jako ZIP (lokálně)\" style=\"margin-top:0;\">';
            html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Stáhnout kurz</a>';
        }
        html += '</div>';

        if (course.sections && course.sections.length > 0) {
            course.sections.forEach(function (section) {
                var hasName = section.name.trim().length > 0;
                
                if (hasName) {
                    html += '<div class="course-section">';
                    var totalItems = (section.items ? section.items.length : 0);
                    if (section.subsections) {
                        section.subsections.forEach(function(s) { totalItems += (s.items ? s.items.length : 0); });
                    }
                    html += '<div class="section-header">';
                    html += '<h3 class="course-section-title">' + escapeHtml(section.name);
                    if (totalItems > 0) {
                        html += ' <span class="course-section-count">(' + totalItems + ')</span>';
                    }
                    html += '</h3>';
                    
                    if (section.dir_path) {
                        html += '<a href=\"javascript:void(0)\" onclick=\"window.downloadCourseAsZip(this, \'' + course.code + '\', \'' + section.dir_path + '\')\" class=\"download-btn-small\" title=\"Stáhnout sekci jako ZIP (lokálně)\">';
                        html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Stáhnout</a>';
                    }
                    html += '</div>';
                    
                    if (section.description) {
                        html += '<p class="course-section-desc">' + escapeHtml(section.description) + '</p>';
                    }
                } else {
                    html += '<div class="course-section" style="margin-top:0; border:none; padding:0; background:none;">';
                }

                if (section.items && section.items.length > 0) {
                    html += '<ul class="file-list">';
                    section.items.forEach(function (item) {
                        html += renderItem(item, course.code);
                    });
                    html += '</ul>';
                }

                if (section.subsections && section.subsections.length > 0) {
                    section.subsections.forEach(function (subsec) {
                        html += '<div class="course-subsection">';
                        html += '<h4 class="course-subsection-title">' + escapeHtml(subsec.name) + '</h4>';
                        if (subsec.items && subsec.items.length > 0) {
                            html += '<ul class="file-list">';
                            subsec.items.forEach(function (item) {
                                html += renderItem(item, course.code);
                            });
                            html += '</ul>';
                        }
                        html += '</div>';
                    });
                }

                html += '</div>';
            });
        }

        html += '</div>';
        detailContent.innerHTML = html;
        closeSidebarOnMobile();
    }

    function closeSidebarOnMobile() {
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('open');
        }
    }

    function bindCourseLinks() {
        var links = document.querySelectorAll('.course-link');
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                closeSidebarOnMobile();
            });
        });
    }

    function updateSidebarActive(code) {
        var items = sidebarCourses.querySelectorAll('.course-item');
        items.forEach(function (item) {
            if (item.getAttribute('data-code') === code) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    function getHashCode() {
        var hash = window.location.hash;
        return hash ? hash.substring(1) : '';
    }

    function navigateTo(code) {
        if (code && courseMap[code]) {
            renderCourse(code);
            updateSidebarActive(code);
            detail.scrollTop = 0;
            if (window.goatcounter && window.goatcounter.count) {
                window.goatcounter.count({ path: '/' + code, title: courseMap[code].name || code });
            }
        } else {
            renderHomepage();
            updateSidebarActive('');
        }
    }

    function onHashChange() { navigateTo(getHashCode()); }

    function onSearchInput() {
        var query = searchInput.value.trim().toLowerCase();
        var queryNorm = removeDiacritics(query);
        var items = sidebarCourses.querySelectorAll('.course-item');
        var visibleCount = 0;

        items.forEach(function (item) {
            var code = (item.getAttribute('data-code') || '').toLowerCase();
            var name = (item.querySelector('.course-name').textContent || '').toLowerCase();
            var nameNorm = removeDiacritics(name);
            var tags = (item.getAttribute('data-tags') || '').toLowerCase();
            var tagsNorm = removeDiacritics(tags);

            var match = !query
                || code.indexOf(query) !== -1
                || name.indexOf(query) !== -1
                || nameNorm.indexOf(queryNorm) !== -1
                || tags.indexOf(query) !== -1
                || tagsNorm.indexOf(queryNorm) !== -1;

            if (match) {
                item.removeAttribute('hidden');
                visibleCount++;
            } else {
                item.setAttribute('hidden', '');
            }
        });

        var sections = sidebarCourses.querySelectorAll('.sidebar-section');
        sections.forEach(function (section) {
            var visibleItems = section.querySelectorAll('.course-item:not([hidden])');
            section.style.display = visibleItems.length === 0 ? 'none' : '';
        });

        if (visibleCount === 0) {
            sidebarEmpty.removeAttribute('hidden');
        } else {
            sidebarEmpty.setAttribute('hidden', '');
        }
    }

    function removeDiacritics(str) {
        if (typeof str !== 'string') return '';
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function getPreferredTheme() {
        var stored = localStorage.getItem('jzphys-theme');
        if (stored) return stored;
        return 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jzphys-theme', theme);
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    function onBrandClick(e) {
        e.preventDefault();
        history.pushState(null, '', window.location.pathname);
        renderHomepage();
        updateSidebarActive('');
    }

    function init() {
        setTheme(getPreferredTheme());
        var yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.innerHTML = '&copy; ' + new Date().getFullYear() + ' JZPhysArchive';

        window.addEventListener('hashchange', onHashChange);
        searchInput.addEventListener('input', onSearchInput);
        themeToggle.addEventListener('click', toggleTheme);
        headerBrand.addEventListener('click', onBrandClick);
        
        if (mobileMenuBtn && sidebarOverlay) {
            mobileMenuBtn.addEventListener('click', function() {
                sidebar.classList.add('open');
                sidebarOverlay.classList.add('open');
            });
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('open');
            });
        }

        // Catch clicks on course links in sidebar to close it on mobile
        var sidebarCourseLinks = sidebarCourses.querySelectorAll('.course-item');
        sidebarCourseLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeSidebarOnMobile();
            });
        });

        navigateTo(getHashCode());
    }


    window.renderCourse = renderCourse;
    window.closeSidebarOnMobile = closeSidebarOnMobile;
    window.renderMarkdown = function(courseCode, itemUrl) {
        var course = courseMap[courseCode];
        if (!course) return;
        
        var targetItem = null;
        course.sections.forEach(function(sec) {
            sec.items.forEach(function(it) { if (it.url === itemUrl) targetItem = it; });
            sec.subsections.forEach(function(sub) {
                sub.items.forEach(function(it) { if (it.url === itemUrl) targetItem = it; });
            });
        });
        
        if (!targetItem) return;
        
        var html = '<div class="markdown-content">';
        html += '<button onclick="renderCourse(\'' + courseCode + '\'); return false;" class="back-link">';
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
        html += 'Zpět na ' + escapeHtml(course.name);
        html += '</button>';
        

        
        html += targetItem.html_content || '<p>Obsah nebyl nalezen.</p>';
        html += '</div>';
        
        detailContent.innerHTML = html;
        detailContent.scrollTop = 0;
        
        // Add copy buttons to code blocks
        var codeBlocks = detailContent.querySelectorAll('.markdown-content pre');
        codeBlocks.forEach(function(block) {
            var wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper';
            wrapper.style.position = 'relative';
            wrapper.style.marginBottom = '24px';
            
            // Move the margin-bottom from pre to wrapper
            block.style.marginBottom = '0';
            
            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);
            
            var btn = document.createElement('button');
            btn.className = 'copy-code-btn';
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy';
            
            btn.onclick = function() {
                var codeNode = block.querySelector('code');
                var textToCopy = codeNode ? codeNode.innerText : block.innerText;
                navigator.clipboard.writeText(textToCopy).then(function() {
                    var oldHtml = btn.innerHTML;
                    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
                    btn.classList.add('copied');
                    setTimeout(function() {
                        btn.innerHTML = oldHtml;
                        btn.classList.remove('copied');
                    }, 2000);
                }).catch(function(err) {
                    console.error('Failed to copy text: ', err);
                });
            };
            
            wrapper.appendChild(btn);
        });
        
        // Hide sidebar on mobile if it was open
        closeSidebarOnMobile();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


// --- JSZip Download Logic ---
window.downloadCourseAsZip = async function(btn, courseCode, prefixPath) {
    if (typeof JSZip === 'undefined') {
        alert("Knihovna JSZip se načítá, zkuste to za okamžik znovu.");
        return;
    }
    
    var course = null;
    for (var cat in COURSES) {
        var found = COURSES[cat].find(c => c.code === courseCode);
        if (found) { course = found; break; }
    }
    
    if (!course || !course.all_files || course.all_files.length === 0) {
        alert("Kurz nemá žádné indexované soubory.");
        return;
    }
    
    var decodedPrefix = prefixPath ? decodeURIComponent(prefixPath) : null;
    var decodedCourseDir = course.dir_path ? decodeURIComponent(course.dir_path) : "";
    
    var filesToDownload = course.all_files;
    if (decodedPrefix) {
        filesToDownload = course.all_files.filter(f => f.startsWith(decodedPrefix));
    }
    
    if (filesToDownload.length === 0) {
        alert("Sekce je prázdná.");
        return;
    }

    var oldHtml = btn.innerHTML;
    var oldPointer = btn.style.pointerEvents;
    btn.style.pointerEvents = 'none';
    
    var zip = new JSZip();
    var total = filesToDownload.length;
    var done = 0;
    
    var rootFolderName = "[" + course.code + "] " + course.name;
    if (decodedPrefix) {
        var parts = decodedPrefix.split('/');
        var secName = parts[parts.length - 1];
        rootFolderName = rootFolderName + " - " + secName;
    }
    
    var promises = filesToDownload.map(async function(file) {
        var url = 'https://cdn.jsdelivr.net/gh/JZPhysArchive/JZPhysArchive@main/' + encodeURI(file).replace(/#/g, '%23').replace(/\?/g, '%3F');
        try {
            var response = await fetch(url);
            if (!response.ok) throw new Error(response.statusText);
            var buffer = await response.arrayBuffer();
            
            var baseDir = decodedPrefix ? decodedPrefix : decodedCourseDir;
            var relPath = file;
            if (file.startsWith(baseDir)) {
                relPath = file.substring(baseDir.length);
                if (relPath.startsWith('/')) relPath = relPath.substring(1);
            }
            
            zip.file(relPath, buffer);
            done++;
            btn.innerHTML = 'Balim (' + done + '/' + total + ')';
        } catch (e) {
            console.error("Failed to download " + file, e);
        }
    });
    
    await Promise.all(promises);
    
    btn.innerHTML = 'Generuji ZIP...';
    
    try {
        var content = await zip.generateAsync({type:"blob"});
        var link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        
        var safeFilename = rootFolderName.replace(/[<>:"/\|?*]+/g, '_');
        link.download = safeFilename + '.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        alert("Chyba při generování ZIPu: " + e);
    }
    
    btn.innerHTML = oldHtml;
    btn.style.pointerEvents = oldPointer;
};

// --- MathJax SPA Integration ---
document.addEventListener('DOMContentLoaded', function() {
    var appElement = document.getElementById('app');
    if (appElement) {
        var observer = new MutationObserver(function() {
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise().catch(function(err){});
            }
        });
        observer.observe(appElement, { childList: true, subtree: true });
    }
});
