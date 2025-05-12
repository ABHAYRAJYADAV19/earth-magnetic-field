from flask import Flask, render_template
import json
from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import numpy as np

app = Flask(__name__)

class EarthRenderer:
    def __init__(self):
        self.rotation = 0.0
        self.texture = None
        
    def init_gl(self, width, height):
        glEnable(GL_DEPTH_TEST)
        glEnable(GL_LIGHTING)
        glEnable(GL_LIGHT0)
        glEnable(GL_COLOR_MATERIAL)
        glClearColor(0.0, 0.0, 0.0, 0.0)
        
        # Setup perspective
        glMatrixMode(GL_PROJECTION)
        gluPerspective(45, (width/height), 0.1, 50.0)
        glMatrixMode(GL_MODELVIEW)

    def draw_earth(self):
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glLoadIdentity()
        
        # Position camera
        gluLookAt(0, 0, 15, 0, 0, 0, 0, 1, 0)
        
        # Rotate earth
        glRotatef(self.rotation, 0, 0, 1)
        
        # Draw sphere for Earth
        sphere = gluNewQuadric()
        gluQuadricTexture(sphere, GL_TRUE)
        gluSphere(sphere, 5, 32, 32)
        
        glutSwapBuffers()
        self.rotation += 0.1

earth_renderer = EarthRenderer()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/render')
def render():
    # This will handle the OpenGL rendering
    earth_renderer.draw_earth()
    return "OK"

@app.route('/api/magnetic-data')
def get_magnetic_data():
    return json.dumps({
        'declination': 0,
        'inclination': 0,
        'intensity': 0
    })

def init_opengl():
    glutInit()
    glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH)
    glutInitWindowSize(800, 600)
    glutCreateWindow(b"Earth Magnetic Field")
    earth_renderer.init_gl(800, 600)

if __name__ == '__main__':
    init_opengl()
    app.run(debug=True)