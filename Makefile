OUTPUT=index.html slides.html # slides.pdf

all: $(OUTPUT)

clean:
	rm -f $(OUTPUT) slides.{snm,aux,out,log,nav,toc,latex}

slides.latex: slides.rst ui/beamerdefs.rst ui/stylesheet.latex
	./bin/rst2beamer.py --stylesheet=ui/stylesheet.latex --documentoptions=14pt slides.rst $@
	sed -i.old 's/\\date{}/\\input{ui\/author.latex}/' $@

slides.pdf: slides.latex
	pdflatex slides.latex

index.html: slides.html
	cp $< $@

slides.html: slides.rst includes/*.html
	rst2s5.py --theme-url ui/mochikit slides.rst $@

.PHONY: all clean
