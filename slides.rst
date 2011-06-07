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
* EUnit
* cover
* meck
* PropEr
* dialyzer
* Jenkins

rebar
=====

* A sophisticated build-tool for Erlang projects that follows OTP
  principles
* https://github.com/basho/rebar
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

    REBAR=`which rebar || ./rebar`
    all: deps compile
    deps:
    	@$(REBAR) get-deps
    compile:
    	@$(REBAR) compile
    test:
    	@$(REBAR) skip_deps=true eunit
    clean:
    	@$(REBAR) clean

rebar alternatives
==================

* In open source Erlang code, rebar seems to have already won
* `Agner`_ complements rebar, provides better package discovery and
  dependency management
* Other tools include CEAN, EPM, Sinan/Faxien but these seem unpopular
* Consolidation would be good here

.. _`Agner`: http://erlagner.org/

EUnit
=====

* Ships with Erlang
* Easy to use
* Works well (enough) with Jenkins

EUnit boilerplate
=================

.. class:: erlang

::

    -ifdef(TEST).
    -include_lib("eunit/include/eunit.hrl").

    %% TEST CODE HERE

    -endif.

EUnit test
==========

.. class:: erlang

::

    inc_0_test() ->
        ?assertEqual(
            1,
            increment(0)).

EUnit test generator
====================

.. class:: erlang

::

    inc_test_() ->
        [{"inc by 0",
          fun () -> ?assertEqual(1, increment(0)) end},
         {"inc by 1",
          ?_test(?assertEqual(2, increment(1)))}].

EUnit fixture
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

running EUnit tests
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

EUnit alternatives
==================

* Common Test also ships with OTP. Much more powerful, but also more
  complicated. We're not writing a lot of system tests yet, so we
  haven't explored this
* Yatsy is an alternative to Common Test used by Kreditor. Doesn't
  seem very popular
* etap is based on Perl's Test Anything Protocol. Not very popular

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

meck
====

* A mocking library for Erlang
* https://github.com/esl/meck
* Makes it possible to test non-functional code
* Can also be used to simplify dependencies

meck usage (constants)
======================

.. class:: erlang

::

    -define(WHENEVER, 1303513575954).

    statebox_test() ->
        meck:new(statebox_clock),
        meck:expect(statebox_clock,
            timestamp, 0, ?WHENEVER),
        […],
        meck:unload(statebox_clock).

meck usage (funs)
=================

.. class:: erlang

::

    next_minute_test() ->
        meck:new(mochierl_util),
        meck:expect(mochierl_util, now_to_msec,
            fun() -> 55000 + 60000 * 123345 end),
        […],
        meck:unload(mochierl_util).


meck fixture for EUnit
======================

.. class:: erlang

::

    meck_setup(Modules) ->
        meck:new(Modules),
        Modules.

    meck_fixture_test_() ->
        {foreach,
         fun meck_setup/0,
         fun meck:unload/1,
         [{"meck test…",
           […]}]}.

meck caveat: OTP modules
========================

* Modules that are "stuck" can't always be mocked
* ``code:unstick_mod/1``, ``code:stick_mod/1`` might work
* Better to just refactor with a proxy module
* For example, ``statebox_clock:timestamp/0`` instead of ``os:timestamp/0``

meck workaround: OTP modules
============================

.. class:: erlang

::

    -module(statebox_clock).
    -export([timestamp/0, now_to_msec/1]).

    %% @doc …
    -spec timestamp() -> integer().
    timestamp() ->
        now_to_msec(os:timestamp()).

meck caveat: side effects
=========================

* The output doesn't depend (only) on the input
* More than one call happens to this function in the test
* We have several hacky workarounds for this
* BUT good solution is in development (see github eproxus/meck)

meck workaround: side effects
=============================

.. class:: erlang

::

    now_test() ->
        meck:new(statebox_clock),
        meck:sequence(statebox_clock, clock, 0,
            [1, 2, 3, 4, 5]),
        ?assertEqual(1, statebox:clock()),
        ?assertEqual(2, statebox:clock()),
        ok.

meck alternatives
=================

* erlymock is probably the only worthy "competitor" for meck
* effigy, emock are unmaintained and do not work with cover
* We only have experience with effigy (legacy code) and meck

PropEr
======

* QuickCheck-inspired property-based testing tool
* https://github.com/manopapad/proper
* You declare high-level properties, it generates the tests
* Great at finding edge cases

PropEr EUnit Skeleton
=====================

.. class:: erlang

::

    %% Before eunit.hrl include
    -include_lib("proper/include/proper.hrl").

    %% EUnit tests
    proper_module_test() ->
        ?assertEqual(
            [],
            proper:module(?MODULE, [long_result])).


PropEr Specs Example
====================

.. class:: erlang

::

    -spec int_ceil(float()) -> integer().
    int_ceil(X) ->
        T = trunc(X),
        case (X - T) of
            Pos when Pos > 0 -> T + 1;
            _ -> T
        end.

    int_ceil_spec_test() ->
       proper:check_spec({?MODULE, int_ceil, 1})


PropEr Property Example
=======================

.. class:: erlang

::

    -spec digits(float()) -> string().
    digits(F) -> […].

    %% In the EUnit test block
    prop_digits_exact() ->
        ?FORALL(F, float(),
                begin
                    F =:= list_to_float(digits(F))
                end).

Proper Generator Example
========================

.. class:: erlang

::

    unichar() ->
        union([integer(0, 16#d7ff),
               integer(16#e000, 16#10ffff)]).

    utf8_binary() ->
        ?LET(L, list(unichar()),
             unicode:characters_to_binary(L, utf8)).

    prop_valid_utf8_bytes_valid() ->
        ?FORALL(B, utf8_binary(),
                begin
                    B =:= valid_utf8_bytes(B)
                end).

PropEr Caveats
==============

* GPLv3 license might be complicated to integrate with your source
* It's a work in progress, no proper release yet
* Missing some useful features (improper lists, custom generators for
  automatic spec testing, etc.)
* Make sure to include PropEr hrl before EUnit (``?LET`` macro conflict)

PropEr Alternatives
===================

* QuviQ QuickCheck - high quality commercial tool with many advanced
  features. Free QuickCheck Mini also available.
* Trifork QuickCheck (triq) - Free (Apache license) QuickCheck
  clone. Does not yet have the unique features in PropEr
