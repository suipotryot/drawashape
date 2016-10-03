(function(QUnit) {

    /**
     * @desc Scene default values
     */
    QUnit.test("Scene constructor default values", function(assert) {
        // Assignation
        var expected = {
            ambiantLightShow: true,
            ambiantLightColor: 0x505050,

            axisHelperShow: true,
            axisHelperSize: 5,

            cam2Dleft: 20,
            cam2Dright: -20,
            cam2Dtop: -10,
            cam2Dbottom: 10,
            cam2Dnear: 0.1,
            cam2Dfar: 100,

            cam3Dfov: 30,
            cam3Daspect: 2,
            cam3Dnear: 1,
            cam3Dfar: 1000,

            gridHelperShow: true,
            gridHelperSize: 10,
            gridHelperStep: 1,
        };
    
        // Action
        var s = new Scene();
    
        // Assertion
        assert.deepEqual(s.options, expected);
    });

    /**
     * @desc Scene overloaded values
     */
    QUnit.test("Scene constructor options given values", function(assert) {
        // Assignation
        var expected = {
            ambiantLightShow: true,
            ambiantLightColor: 0x505050,

            axisHelperShow: true,
            axisHelperSize: 5,

            cam2Dleft: 88,
            cam2Dright: -20,
            cam2Dtop: -10,
            cam2Dbottom: 10,
            cam2Dnear: 0.1,
            cam2Dfar: 100,

            cam3Dfov: 66,
            cam3Daspect: 2,
            cam3Dnear: 1,
            cam3Dfar: 1000,

            gridHelperShow: true,
            gridHelperSize: 10,
            gridHelperStep: 1,
        };
    
        // Action
        var s = new Scene({cam2Dleft: 88, cam3Dfov: 66});
    
        // Assertion
        assert.deepEqual(s.options, expected);
    });

})(QUnit);
