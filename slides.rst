.. include:: <s5defs.txt>
.. include:: ui/beamerdefs.rst

.. raw:: html
    :file: includes/logo.html

===================================
Practical Erlang testing techniques
===================================

:Author:
    Bob Ippolito (@etrepum)
:Date:
    June 2011
:Venue:
    Erlang Factory London 2011

Mochi Media's Code
==================

* Substantial multi-language codebase
* Erlang code going back to 2006
* Did not always have good tests :(

Doing It Wrong
==============

* Write code without tests or review
* Push to production branch
* Deploy
* Firefight [and repeat]

Doing It Better
===============

* Write code, tests and docs
* Push to issue branch
* Review [and repeat]
* Merge to production branch
* Continuous Integration server runs tests (again)
* Deploy

Cool Tools (for testing)
========================

* rebar
* eunit
* cover
* meck
* dialyzer
* proper
* Jenkins

rebar
=====

* "A sophisticated build-tool for Erlang projects that follows OTP principles"
* Handles common build tasks
* Builds your .app from an .app.src
* Manages dependencies (somewhat)

rebar src/yourapp.app.src
=========================

.. class:: erlang

::

    {application, yourapp,
     [{description, "..."},
      {vsn, "1.2.3"}]}.

rebar.config
============

.. class:: erlang

::

    {erl_opts, [fail_on_warning,
                debug_info]}.
    {cover_enabled, true}.
    {clean_files, ["*.eunit", "ebin/*.beam"]}.
    {eunit_opts, [verbose,
        {report,{eunit_surefire,[{dir,"."}]}}]}.

rebarized Makefile
==================

.. class:: bash

::

    REBAR=./rebar
    all:
    	@$(REBAR) get-deps compile
    edoc:
    	@$(REBAR) skip_deps=true doc
    test:
    	@$(REBAR) skip_deps=true eunit
    clean:
    	@$(REBAR) clean

eunit
=====

* Ships with Erlang
* Easy to use
* Works well (enough) with Jenkins

eunit boilerplate
=================

.. class:: erlang

::

    -ifdef(TEST).
    -include_lib("eunit/include/eunit.hrl").

    %% TEST CODE HERE

    -endif.

eunit test
==========

.. class:: erlang

::

    inc_0_test() ->
        ?assertEqual(
            1,
            increment(0)).

eunit test generator
====================

.. class:: erlang

::

    inc_test_() ->
        [{"inc by 0",
          fun () -> ?assertEqual(1, increment(0)) end},
         {"inc by 1",
          ?_test(?assertEqual(2, increment(1)))}].

eunit fixture
=============

.. class:: erlang

::

    inc_setup() -> return_value_from_setup.

    inc_cleanup(setup_return_value) -> ok.

    inc_fixture_test_() ->
        {foreach,
         fun inc_setup/0,
         fun inc_cleanup/1,
         [{"inc by 0",
           ?_test(?assertEqual(1, increment(0)))}]}.

running eunit tests
===================

.. class:: bash

::

    $ make test
    ==> inc (eunit)
    Compiled src/inc.erl
    ======================== EUnit ========================
    module 'inc'
      inc: inc_0_test...ok
      […]
     [done in 0.012 s]
    =======================================================
      All 4 tests passed.
    Cover analysis: /Users/bob/tmp/inc/.eunit/index.html

cover
=====

* A Coverage Analysis Tool for Erlang
* Ships with Erlang
* Run by rebar eunit (with ``{cover_enabled, true}.``)

cover html output
=================

* open ``.eunit/index.html`` in a browser
* Lists analysed modules with module coverage
* 100% is awesome, go for that
* Click on module name to see report
* Source lines not covered are colored red

